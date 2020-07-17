import {Master, Video} from "../collections";

import {XMLTransformerError, createXMLTransformer, ignoreNodeTransformer} from "./xmlTransformer";
import { childResultsToSingular, withRequiredProperties } from "./helpers";
import {
  createListTransformer,
  intElementTransformer,
  textElementTransformer, yearElementTransformer,
} from "./commonTransformers";
import { artistsTransformer } from "./artistTransformers";

export const genresTransformer = createListTransformer(
  "genre",
  textElementTransformer
);

export const stylesTransformer = createListTransformer(
  "style",
  textElementTransformer
);

export const videoTransformer = createXMLTransformer({
  title: textElementTransformer,
  description: textElementTransformer,
})((childResults, { attributes = {} }) => {
  const { title, description } = childResultsToSingular(childResults, "title", "description");

  const result: Video = withRequiredProperties(
    { title, description, src: attributes.src },
    "src"
  );

  if (attributes.duration) {
    result.originalDuration = attributes.duration;

    const parts = attributes.duration.split(/[:.]/g);
    if (parts.some(part => !part.match(/^\d+$/))) {
      console.warn(`Could not parse duration "${attributes.duration}"`);
    } else {
      const hours = parts.length > 2 ? parseInt(parts[parts.length - 2], 10) : 0;
      const minutes = parts.length > 1 ? parseInt(parts[parts.length - 2], 10) : 0;
      const seconds = parseInt(parts[parts.length - 1], 10);

      result.duration = seconds + minutes * 60 + hours * 60 * 60;
    }
  }

  return result;
});

export const videosTransformer = createListTransformer(
  "video",
  videoTransformer
);

export const masterTransformer = createXMLTransformer({
  main_release: intElementTransformer,
  images: ignoreNodeTransformer,
  artists: artistsTransformer,
  genres: genresTransformer,
  styles: stylesTransformer,
  year: yearElementTransformer,
  title: textElementTransformer,
  data_quality: textElementTransformer,
  videos: videosTransformer,
  notes: textElementTransformer,
})<Master>(
  (childResults, { attributes}) => {
    const {
      main_release: mainRelease,
      artists = [],
      styles = [],
      genres = [],
      videos = [],
      year,
      notes,
      title,
      data_quality: dataQuality
    } = childResultsToSingular(
      childResults,
      "main_release",
      "artists",
      "styles",
      "genres",
      "notes",
      "videos",
      "year",
      "data_quality",
      "title"
    );
    if (!attributes || !attributes.id) {
      throw new XMLTransformerError(`Expected attribute "id"`);
    }
    const id = parseInt(attributes.id, 10);
    if (isNaN(id)) {
      throw new XMLTransformerError(`attribute "id" couldn't be parsed to integer`);
    }
    return withRequiredProperties(
      { mainRelease, artists, styles, year, title, genres, dataQuality, videos, id, notes },
      "mainRelease",
      "id",
      "title"
    );
  },
);
