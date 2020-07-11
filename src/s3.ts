import fetch from "node-fetch";
import { groupBy, keyBy, mapValues } from "lodash-es";
import idx from "idx";
import xml2js from "xml2js";

import { BUCKET_URL, S3B_ROOT_DIR } from "./constants";

export function createS3QueryUrl(prefix = S3B_ROOT_DIR, marker?: string) {
  let s3RestUrl = BUCKET_URL;
  s3RestUrl += "?delimiter=/";

  if (prefix) {
    s3RestUrl += `&prefix=${prefix.replace(/\/$/, "")}/`;
  }
  if (marker) {
    s3RestUrl += `&marker=${marker}`;
  }
  return s3RestUrl;
}

export async function requestListing(yearPrefix?: string) {
  const s3QueryUrl = createS3QueryUrl(yearPrefix);

  let directoryResponse;

  try {
    const resp = await fetch(s3QueryUrl);
    directoryResponse = await resp.text();
  } catch (e) {
    throw new Error(`Failed to request ${s3QueryUrl}:\n${e}`);
  }

  let parsed;
  try {
    parsed = await xml2js.parseStringPromise(directoryResponse);
  } catch (e) {
    throw new Error(`Error parsing directory XML: ${e}`);
  }

  return parsed;
}

/**
 * Fetch a set of years available on the Discogs data S3 bucket with their
 * paths on the bucket.
 * @returns {Promise<Array<{path:string, year:number}>>}
 */
export async function fetchYearListings() {
  console.log("Fetching year listings...");

  const parsed = await requestListing();

  const prefixes: undefined | Array<{ Prefix: Array<string> }> = idx(
    parsed,
    (_) => _.ListBucketResult.CommonPrefixes
  );
  if (!prefixes) {
    throw new Error("Could not find prefixes on S3 directory listings");
  }

  const years = prefixes.map(({ Prefix: [Prefix] }) => ({
    path: Prefix,
    year: parseInt(Prefix.replace(/^data\//, "").replace(/\/$/, ""), 10),
  }));

  years.sort((a, b) => b.year - a.year);

  return years;
}

/**
 * Fetch the list of files available on the S3 bucket for a certain year
 * @param yearPrefix {string} The year prefix of the file. For example:
 * "data/2016/"
 * @returns {Promise<Array<string>>} An array of paths
 */
export async function fetchFileListing(yearPrefix?: string) {
  console.log("Fetching file listings...");

  const parsed = await requestListing(yearPrefix);
  const files: undefined | Array<{ Key: Array<string> }> = idx(
    parsed,
    (_) => _.ListBucketResult.Contents
  );
  if (!files) {
    throw new Error("Could not find files on S3 listings");
  }

  return files
    .map(({ Key: [key] }) => key)
    .filter((f) => f.endsWith(".xml.gz"));
}

/**
 * Parse a list of file paths (as returned by fetchFileListing). Groups them
 * by year
 * @param filenames
 * @returns An object with keys for each year and an array of parsed
 * path objects as values.
 */
export function parseFileNames(filenames: Array<string>) {
  const parsed = filenames.map((path) => {
    const match = path.match(/discogs_([\d]+)_([^.]+)\.xml/);
    if (!match) {
      throw new Error("Unable to parse filenames from S3 listing");
    }
    return {
      url: `${BUCKET_URL}/${path}`,
      path,
      year: parseInt(match[1], 10),
      type: match[2],
    };
  });

  return mapValues(
    groupBy(parsed, (_) => _.year),
    (r) => keyBy(r, (_) => _.type)
  );
}
