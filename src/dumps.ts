import { BUCKET_URL } from "./constants";
import { fetchFileListing, fetchYearListings, parseFileNames } from "./s3";
import {CollectionType} from "./collections";

/**
 * Get the URL for a checksum file of the specified version
 * @param version {string} The exact version name, eg '20180101'
 * @returns {string}
 */
export function getChecksumURL(version: string) {
  return `${BUCKET_URL}/data/${version.substring(
    0,
    4
  )}/discogs_${version}_CHECKSUM.txt`;
}

/**
 * Get the URL for a specific data dump
 * @param version {string} The exact version name, eg '20180101'
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @returns {string}
 */
export function getDumpURL(version: string, collection: CollectionType) {
  return `${BUCKET_URL}/data/${version.substring(
    0,
    4
  )}/discogs_${version}_${collection}.xml.gz`;
}

/**
 * Gets the name of the latest version available in the S3 bucket
 * @returns {Promise<string>} A promise that resolves with the version name
 */
export async function getLatestVersion() {
  const years = await fetchYearListings();
  const files = await fetchFileListing(years[0].path);
  const versions = parseFileNames(files);

  const versionNames = Object.keys(versions).map((v) => parseInt(v, 10));
  versionNames.sort((a, b) => b - a);

  return versionNames[0].toString();
}
