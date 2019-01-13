const request = require("request-promise-native");
const xml2js = require("xml2js");
const idx = require("idx");
const _ = require("lodash");
const { promisify } = require("es6-promisify");

const parseString = promisify(xml2js.parseString);

const BUCKET_URL = "https://discogs-data.s3-us-west-2.amazonaws.com";
const S3B_ROOT_DIR = "data/";

function getDumpURL(version, type) {
  return `https://discogs-data.s3-us-west-2.amazonaws.com/data/${version.substring(
    0,
    4
  )}/discogs_${version}_${type}.xml.gz`;
}

function createS3QueryUrl(prefix = S3B_ROOT_DIR, marker) {
  let s3_rest_url = BUCKET_URL;
  s3_rest_url += "?delimiter=/";

  if (prefix) {
    prefix = prefix.replace(/\/$/, "") + "/";
    s3_rest_url += "&prefix=" + prefix;
  }
  if (marker) {
    s3_rest_url += "&marker=" + marker;
  }
  return s3_rest_url;
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

async function fetchYearListings() {
  console.log("Fetching year listings...");

  const parsed = await await requestListing();

  const prefixes = idx(parsed, _ => _.ListBucketResult.CommonPrefixes);
  if (!prefixes) {
    throw new Error("Could not find prefixes on S3 directory listings");
  }

  return prefixes.map(({ Prefix: [Prefix] }) => ({
    path: Prefix,
    year: parseInt(Prefix.replace(/^data\//, "").replace(/\/$/, ""), 10)
  }));
}

async function fetchFileListing(yearPrefix) {
  console.log("Fetching file listings...");

  const parsed = await requestListing(yearPrefix);
  const files = idx(parsed, _ => _.ListBucketResult.Contents);
  if (!files) {
    throw new Error("Could not find files on S3 listings");
  }

  return files.map(({ Key: [key] }) => key).filter(f => f.endsWith(".xml.gz"));
}

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

  return _.mapValues(_.groupBy(parsed, _ => _.year), r =>
    _.keyBy(r, _ => _.type)
  );
}

module.exports = {
  fetchYearListings,
  fetchFileListing,
  getDumpURL,
  parseFileNames
};
