import {XMLTransformerError} from "./xmlTransformer";

export const withRequiredProperties = <TInput, TProp extends keyof TInput>(
  input: TInput,
  ...props: Array<TProp>
) => {
  for (const prop of props) {
    if (input[prop] === undefined || input[prop] === null) {
      throw new XMLTransformerError(
        `expected to have required prop "${prop}" when finalized`
      );
    }
  }

  return input as TInput &
    {
      [P in TProp]-?: NonNullable<TInput[P]>;
    };
};

export const childResultsToSingular = <TInput, TProp extends keyof TInput>(
  input: TInput,
  ...props: Array<TProp>
) => {
  const outp = {} as any;

  for (const prop of props) {
    const value = input[prop];
    if (value !== undefined) {
      if (!Array.isArray(value)) {
        throw new XMLTransformerError(
          `expected property "${prop}" to be an Array`
        );
      }

      if (value.length > 1) {
        throw new XMLTransformerError(`expected at most 1 <${prop}> element`);
      }

      outp[prop] = value[0];
    }
  }

  return outp as Omit<TInput, TProp> & Pick<{[K in keyof TInput]: TInput extends Array<infer I> ? I : never}, TProp>;
};