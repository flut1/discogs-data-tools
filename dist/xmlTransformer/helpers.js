import { XMLTransformerError } from "./xmlTransformer";
export const withRequiredProperties = (input, ...props) => {
    for (const prop of props) {
        if (input[prop] === undefined || input[prop] === null) {
            throw new XMLTransformerError(`expected to have required prop "${prop}" when finalized`);
        }
    }
    return input;
};
export const childResultsToSingular = (input, ...props) => {
    const outp = {};
    for (const prop of props) {
        const value = input[prop];
        if (value !== undefined) {
            if (!Array.isArray(value)) {
                throw new XMLTransformerError(`expected property "${prop}" to be an Array`);
            }
            if (value.length > 1) {
                throw new XMLTransformerError(`expected at most 1 <${prop}> element`);
            }
            outp[prop] = value[0];
        }
    }
    return outp;
};
