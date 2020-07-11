import {createXMLTransformer, IGNORE_NODE, XMLTransformerError} from "./xmlTransformer";
import {createListTransformer, intElementTransformer, textElementTransformer} from "./commonTransformers";
import {ArtistRef} from "../collections";
import {childResultsToSingular, withRequiredProperties} from "./helpers";

export const nameTransformer = createXMLTransformer({})<{
  name: string;
  nameIndex: number;
  originalName: string;
}>((_, {textContent}) => {
  if (!textContent) {
    return IGNORE_NODE;
  }

  const indexedNameMatch = textContent.match(
    /^([\s\S]+?)(?:\s?\((\d{1,3})\))?$/
  );
  if (!indexedNameMatch) {
    throw new XMLTransformerError(
      `text "${textContent}" did not match regex pattern`
    );
  }

  return {
    originalName: textContent,
    name: indexedNameMatch[1],
    nameIndex: indexedNameMatch[2] ? parseInt(indexedNameMatch[2], 10) : 1,
  };
});

export const artistTransformer = createXMLTransformer({
  id: intElementTransformer,
  name: nameTransformer,
  anv: nameTransformer,
  join: textElementTransformer,
  role: textElementTransformer,
  tracks: textElementTransformer,
})<ArtistRef>((childResults) => {
  const {
    id,
    name: {name, nameIndex, originalName},
    join,
    role,
    tracks,
    anv = [],
  } = childResultsToSingular(
    withRequiredProperties(childResults, "id", "name"),
    "id",
    "name",
    "join",
    "role",
    "tracks"
  );
  return {
    id,
    name,
    nameIndex,
    originalName,
    join,
    role,
    tracks,
    anv,
  };
});

export const artistsTransformer = createListTransformer(
  "artist",
  artistTransformer
);