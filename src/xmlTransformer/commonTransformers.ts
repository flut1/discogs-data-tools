import {createXMLTransformer, IGNORE_NODE, XMLTransformer, XMLTransformerError,} from "./xmlTransformer";

export const intElementTransformer = createXMLTransformer({})(
  (_, { textContent }) => {
    if (textContent === undefined) return IGNORE_NODE;
    const int = parseInt(textContent, 10);
    if (isNaN(int)) {
      throw new XMLTransformerError(
        `cannot parse text "${textContent}" to integer`
      );
    }

    return int;
  }
);

export const yearElementTransformer = createXMLTransformer({})(
  (_, { textContent }) => {
    if (textContent === undefined) return IGNORE_NODE;
    const int = parseInt(textContent, 10);
    if (isNaN(int)) {
      throw new XMLTransformerError(
        `cannot parse text "${textContent}" to integer`
      );
    }
    if (int === 0) {
      return IGNORE_NODE;
    }

    return int;
  }
);

export const textElementTransformer = createXMLTransformer(
  {}
)((_, { textContent }) =>
  textContent === undefined ? IGNORE_NODE : textContent
);

export const createListTransformer = <TItem>(
  itemName: string,
  itemTransformer: XMLTransformer<TItem>
) =>
  createXMLTransformer({
    [itemName]: itemTransformer,
  })(({ [itemName]: children }) => (children || []) as Array<TItem>);
