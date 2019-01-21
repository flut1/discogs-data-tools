const request = require("request-promise-native");
const xml2js = require("xml2js");
const idx = require("idx");
const lodash = require("lodash");
const { promisify } = require("es6-promisify");
const logger = require("./util/logger");

/**
 * Lookup available data dumps on the S3 bucket
 * @module bucket
 */

const parseString = promisify(xml2js.parseString);

const BUCKET_URL = "https://discogs-data.s3-us-west-2.amazonaws.com";
const S3B_ROOT_DIR = "data/";

/**
 * Get the URL for a specific data dump
 * @param version {string} The exact version name, eg '20180101'
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @returns {string}
 */
function getDumpURL(version, collection) {
  return `https://discogs-data.s3-us-west-2.amazonaws.com/data/${version.substring(
    0,
    4
  )}/discogs_${version}_${collection}.xml.gz`;
}

/**
 * Get the URL for a checksum file of the specified version
 * @param version {string} The exact version name, eg '20180101'
 * @returns {string}
 */
function getChecksumURL(version) {
  return `https://discogs-data.s3-us-west-2.amazonaws.com/data/${version.substring(
    0,
    4
  )}/discogs_${version}_CHECKSUM.txt`;
}

function createS3QueryUrl(prefix = S3B_ROOT_DIR, marker) {
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

async function requestListing(yearPrefix) {
  const s3QueryUrl = createS3QueryUrl(yearPrefix);

  let directoryResponse;

  try {
    directoryResponse = await request({
      url: s3QueryUrl
    });
  } catch (e) {
    throw new Error(`Failed to request ${s3QueryUrl}:\n${e}`);
  }

  let parsed;
  try {
    parsed = await parseString(directoryResponse);
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
async function fetchYearListings() {
  logger.status("Fetching year listings...", true);

  const parsed = await await requestListing();

  const prefixes = idx(parsed, _ => _.ListBucketResult.CommonPrefixes);
  if (!prefixes) {
    throw new Error("Could not find prefixes on S3 directory listings");
  }

  const years = prefixes.map(({ Prefix: [Prefix] }) => ({
    path: Prefix,
    year: parseInt(Prefix.replace(/^data\//, "").replace(/\/$/, ""), 10)
  }));

  years.sort((a, b) => (b.year - a.year));

  return years;
}



/**
 * Fetch the list of files available on the S3 bucket for a certain year
 * @param yearPrefix {string} The year prefix of the file. For example:
 * "data/2016/"
 * @returns {Promise<Array<string>>} An array of paths
 */
async function fetchFileListing(yearPrefix) {
  logger.status("Fetching file listings...", true);

  const parsed = await requestListing(yearPrefix);
  const files = idx(parsed, _ => _.ListBucketResult.Contents);
  if (!files) {
    throw new Error("Could not find files on S3 listings");
  }

  return files.map(({ Key: [key] }) => key).filter(f => f.endsWith(".xml.gz"));
}

/**
 * Parse a list of file paths (as returned by fetchFileListing). Groups them
 * by year
 * @param filenames {Array<string>}
 * @returns {Object} An object with keys for each year and an array of parsed
 * path objects as values.
 */
function parseFileNames(filenames) {
  const parsed = filenames.map(path => {
    const match = path.match(/discogs_([\d]+)_([^.]+)\.xml/);
    if (!match) {
      throw new Error("Unable to parse filenames from S3 listing");
    }
    return {
      url: `${BUCKET_URL}/${path}`,
      path,
      year: parseInt(match[1], 10),
      type: match[2]
    };
  });

  return lodash.mapValues(lodash.groupBy(parsed, _ => _.year), r =>
    lodash.keyBy(r, _ => _.type)
  );
}

/**
 * Gets the name of the latest version available in the S3 bucket
 * @returns {Promise<string>} A promise that resolves with the version name
 */
async function getLatestVersion() {
  const years = await fetchYearListings();
  const files = await fetchFileListing(years[0].path);
  const versions = parseFileNames(files);

  const versionNames = Object.keys(versions).map(v => parseInt(v, 10));
  versionNames.sort((a, b) => b - a);

  return versionNames[0].toString();
}

module.exports = {
  fetchYearListings,
  getDumpURL,
  getChecksumURL,
  getLatestVersion,
  fetchFileListing,
  parseFileNames
};
