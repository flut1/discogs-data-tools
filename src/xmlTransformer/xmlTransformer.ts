import { AnyFunc, TypedObjectKeys } from "../util/utilTypes";

export const noop = () => {};
export const identity = <T>(_: T) => _;

export const IGNORE_NODE = Symbol("Ignore node");

export namespace XMLTransformer {
  export type Attributes = { [key: string]: string };

  export type State<TResult> = {
    onElementStart(name: string, attributes: Attributes): void;
    onElementEnd(name: string): TResult | IgnoreNodeSymbol | null;
    onText(content: string): void;
  };

  export type Transformer<TResult> = (
    name: string,
    attributes?: Attributes
  ) => State<TResult>;

  export type ChildMap = {
    [name: string]: Transformer<any>;
  };

  export type ResultsForChildren<TChildren extends ChildMap> = {
    [TName in keyof TChildren]?: TChildren[TName] extends Transformer<infer R>
      ? Array<R>
      : never;
  };

  export type IgnoreNodeSymbol = typeof IGNORE_NODE;

  export type FinalizeFn<TChildren extends ChildMap, TResult> = (
    childResults: ResultsForChildren<TChildren>,
    meta: { textContent: string | undefined, attributes: Attributes | undefined }
  ) => TResult | IgnoreNodeSymbol;
}

export type XMLTransformer<TResult> = XMLTransformer.Transformer<TResult>;

export class XMLTransformerError extends Error {
  private path: Array<string> = [];

  constructor(private rawMessage: string) {
    super(rawMessage);
  }

  public prependPath(segment: string) {
    this.path.unshift(segment);
    this.message = `(${this.path.join(" > ")}) ${this.rawMessage}`;
  }
}

export function isXMLTransformerError(
  error: Error
): error is XMLTransformerError {
  return error && typeof (error as any).prependPath === "function";
}

const TRANSFORMER_DEBUG = false;

export const ignoreNodeTransformer: XMLTransformer<never> = (name: string) => {
  let startCount = 0;
  return {
    onElementStart() {
      startCount++;
    },
    onElementEnd(endElementName: string) {
      if (!startCount) {
        if (endElementName !== name) {
          const error = new XMLTransformerError(
            `expected closing </${name}>, got </${endElementName}>`
          );
          error.prependPath(name);
          throw error;
        }
        return IGNORE_NODE;
      }
      startCount--;
      return null;
    },
    onText() {},
  };
};

export const createXMLTransformer = <
  TChildren extends XMLTransformer.ChildMap
>(
  childTransformers: TChildren
) => <TResult>(
  finalize: XMLTransformer.FinalizeFn<TChildren, TResult>,
  options: {
    onError?: (error: Error) => any;
    allowUnknownChild?: boolean;
  } = {}
): XMLTransformer<TResult> => {
  const { allowUnknownChild = false } = options;
  const childElementNames = (Object.keys as TypedObjectKeys)(childTransformers);

  return (name, attributes) => {
    const childResults = Object.fromEntries(
      childElementNames.map((key) => [key, [] as Array<any>])
    ) as XMLTransformer.ResultsForChildren<TChildren>;
    let textContent: string | undefined;
    let activeChildTransformer: XMLTransformer.State<any> | null = null;

    const wrapErrorHandler = <TFunc extends AnyFunc>(fn: TFunc) => (
      ...args: Array<any>
    ) => {
      try {
        return fn(...args);
      } catch (e) {
        if (isXMLTransformerError(e)) {
          e.prependPath(`${name}${attributes && Object.values(attributes).length ? JSON.stringify(attributes) : ''}`);
        }

        if (options.onError) {
          options.onError(e);
        } else {
          throw e;
        }
      }
    };

    const state: XMLTransformer.State<TResult> = {
      onElementStart(startElementName, startElementAttributes) {
        if (activeChildTransformer) {
          return activeChildTransformer.onElementStart(
            startElementName,
            startElementAttributes
          );
        }

        let childTransformer = childTransformers[startElementName];
        if (!childTransformer && allowUnknownChild) {
          childTransformer = ignoreNodeTransformer;
        }

        if (!childTransformer) {
          throw new XMLTransformerError(
            `encountered node with unknown name <${startElementName}>`
          );
        }

        activeChildTransformer = childTransformer(
          startElementName,
          startElementAttributes
        );

        if (TRANSFORMER_DEBUG) {
          Object.keys(activeChildTransformer).forEach((key: any) => {
            const original = (activeChildTransformer as any)[key];
            (activeChildTransformer as any)[key] = (...args: any) => {
              console.log('START', startElementName, key, ...args);
              return original(...args);
            };
          });
        }
      },
      onElementEnd(endElementName) {
        if (!activeChildTransformer) {
          if (endElementName !== name) {
            throw new XMLTransformerError(
              `unexpected end node </${endElementName}>`
            );
          }
          return finalize(childResults, { textContent, attributes });
        }
        const finalizedResult = activeChildTransformer.onElementEnd(
          endElementName
        );
        if (finalizedResult !== null) {
          if (!childElementNames.includes(endElementName)) {
            throw new XMLTransformerError(
              `end node with unexpected name </${endElementName}>`
            );
          }
          if (finalizedResult !== IGNORE_NODE) {
            childResults[endElementName]!.push(finalizedResult);
          }

          if (TRANSFORMER_DEBUG) {
            console.log('FINALIZE', endElementName, finalizedResult);
          }
          activeChildTransformer = null;
        }
        return null;
      },
      onText(text) {
        if (activeChildTransformer) {
          return activeChildTransformer.onText(text);
        }

        if (textContent === undefined) {
          textContent = text;
        } else {
          textContent += text;
        }
      },
    };
    (Object.keys as TypedObjectKeys)(state).forEach((key) => {
      state[key] = wrapErrorHandler(state[key]);
    });

    return state;
  };
};
