export class XMLTransformerError extends Error {
    constructor(rawMessage) {
        super(rawMessage);
        this.rawMessage = rawMessage;
        this.path = [];
    }
    prependPath(segment) {
        this.path.unshift(segment);
        this.message = `(${this.path.join(" > ")}) ${this.rawMessage}`;
    }
}
export function isXMLTransformerError(error) {
    return error && typeof error.prependPath === "function";
}
export const noop = () => { };
export const identity = (_) => _;
export const noText = (text) => {
    if (!text.trim().length) {
        return;
    }
    throw new XMLTransformerError(`Unexpected text node "${text}"`);
};
export const createXMLTransformer = (childTransformers, finalize, options = {}) => {
    const attributesHandler = options.attributes || (() => noop);
    const textHandler = options.text || (() => noText);
    const childElementNames = Object.keys(childTransformers);
    const isChildElementName = (name) => childElementNames.includes(name);
    return (name, attributes) => {
        const partialResult = {};
        const childResults = Object.fromEntries(childElementNames.map((key) => [key, []]));
        let activeChildTransformer = null;
        const wrapErrorHandler = (fn) => (...args) => {
            try {
                return fn(...args);
            }
            catch (e) {
                if (isXMLTransformerError(e)) {
                    e.prependPath(name);
                }
                if (options.onError) {
                    options.onError(e);
                }
                else {
                    throw e;
                }
            }
        };
        const onAttributes = wrapErrorHandler(attributesHandler(partialResult));
        const onText = textHandler(partialResult);
        const finalizeChildResults = finalize(partialResult);
        if (attributes) {
            onAttributes(attributes);
        }
        const state = {
            onElementStart(startElementName, startElementAttributes) {
                if (activeChildTransformer) {
                    return activeChildTransformer.onElementStart(startElementName, startElementAttributes);
                }
                if (!childTransformers[startElementName]) {
                    throw new XMLTransformerError(`encountered node with unknown name <${startElementName}>`);
                }
                activeChildTransformer = childTransformers[startElementName](startElementName, startElementAttributes);
            },
            onElementEnd(endElementName) {
                if (!activeChildTransformer) {
                    if (endElementName !== name) {
                        throw new XMLTransformerError(`unexpected end node </${endElementName}>`);
                    }
                    return finalizeChildResults(childResults);
                }
                const finalizedResult = activeChildTransformer.onElementEnd(endElementName);
                if (!isChildElementName(endElementName)) {
                    throw new XMLTransformerError(`unexpected end node </${endElementName}>`);
                }
                if (finalizedResult) {
                    childResults[endElementName] = finalizedResult;
                    activeChildTransformer = null;
                }
                return null;
            },
            onText(text) {
                if (activeChildTransformer) {
                    return activeChildTransformer.onText(text);
                }
                return onText(text);
            },
        };
        Object.keys(state).forEach(key => {
            state[key] = wrapErrorHandler(state[key]);
        });
        return state;
    };
};
// export const createXMLTransformStream = <TChildren extends XMLTransformer.ChildMap, TResult>(
//   childTransformers: TChildren,
// ): Transform => {
//   return new Transform({
//     decodeStrings: false,
//     transform(chunk: )
//   })
// }
