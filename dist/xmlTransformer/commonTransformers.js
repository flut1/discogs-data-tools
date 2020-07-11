import { createXMLTransformer, IGNORE_NODE, XMLTransformerError, } from "./xmlTransformer";
export const intElementTransformer = createXMLTransformer({})((_, { textContent }) => {
    if (textContent === undefined)
        return IGNORE_NODE;
    const int = parseInt(textContent, 10);
    if (isNaN(int)) {
        throw new XMLTransformerError(`cannot parse text "${textContent}" to integer`);
    }
    return int;
});
export const textElementTransformer = createXMLTransformer({})((_, { textContent }) => textContent === undefined ? IGNORE_NODE : textContent);
export const createListTransformer = (itemName, itemTransformer) => createXMLTransformer({
    [itemName]: itemTransformer,
})(({ [itemName]: children }) => (children || []));
