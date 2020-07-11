export const noop = () => { };
export const identity = (_) => _;
export const IGNORE_NODE = Symbol("Ignore node");
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
const TRANSFORMER_DEBUG = false;
export const ignoreNodeTransformer = (name) => {
    let startCount = 0;
    return {
        onElementStart() {
            startCount++;
        },
        onElementEnd(endElementName) {
            if (!startCount) {
                if (endElementName !== name) {
                    const error = new XMLTransformerError(`expected closing </${name}>, got </${endElementName}>`);
                    error.prependPath(name);
                    throw error;
                }
                return IGNORE_NODE;
            }
            startCount--;
            return null;
        },
        onText() { },
    };
};
export const createXMLTransformer = (childTransformers) => (finalize, options = {}) => {
    const { allowUnknownChild = false } = options;
    const childElementNames = Object.keys(childTransformers);
    return (name, attributes) => {
        const childResults = Object.fromEntries(childElementNames.map((key) => [key, []]));
        let textContent;
        let activeChildTransformer = null;
        const wrapErrorHandler = (fn) => (...args) => {
            try {
                return fn(...args);
            }
            catch (e) {
                if (isXMLTransformerError(e)) {
                    e.prependPath(`${name}${attributes && Object.values(attributes).length ? JSON.stringify(attributes) : ''}`);
                }
                if (options.onError) {
                    options.onError(e);
                }
                else {
                    throw e;
                }
            }
        };
        const state = {
            onElementStart(startElementName, startElementAttributes) {
                if (activeChildTransformer) {
                    return activeChildTransformer.onElementStart(startElementName, startElementAttributes);
                }
                let childTransformer = childTransformers[startElementName];
                if (!childTransformer && allowUnknownChild) {
                    childTransformer = ignoreNodeTransformer;
                }
                if (!childTransformer) {
                    throw new XMLTransformerError(`encountered node with unknown name <${startElementName}>`);
                }
                activeChildTransformer = childTransformer(startElementName, startElementAttributes);
                if (TRANSFORMER_DEBUG) {
                    Object.keys(activeChildTransformer).forEach((key) => {
                        const original = activeChildTransformer[key];
                        activeChildTransformer[key] = (...args) => {
                            console.log('START', startElementName, key, ...args);
                            return original(...args);
                        };
                    });
                }
            },
            onElementEnd(endElementName) {
                if (!activeChildTransformer) {
                    if (endElementName !== name) {
                        throw new XMLTransformerError(`unexpected end node </${endElementName}>`);
                    }
                    return finalize(childResults, { textContent, attributes });
                }
                const finalizedResult = activeChildTransformer.onElementEnd(endElementName);
                if (finalizedResult !== null) {
                    if (!childElementNames.includes(endElementName)) {
                        throw new XMLTransformerError(`end node with unexpected name </${endElementName}>`);
                    }
                    if (finalizedResult !== IGNORE_NODE) {
                        childResults[endElementName].push(finalizedResult);
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
                }
                else {
                    textContent += text;
                }
            },
        };
        Object.keys(state).forEach((key) => {
            state[key] = wrapErrorHandler(state[key]);
        });
        return state;
    };
};
