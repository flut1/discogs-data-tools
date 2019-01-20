const path = require("path");
const sumchecker = require("sumchecker");
const { ensureChecksum } = require("./fetcher");
const { COLLECTIONS } = require("./constants");

async function verify(version, collections = COLLECTIONS, dataDir) {
  const checksumPath = await ensureChecksum(version, dataDir);

  console.log("Verifying with checksum...");
  await sumchecker(
    "sha256",
    checksumPath,
    path.resolve(dataDir, version),
    collections.map(collection => `discogs_${version}_${collection}.xml.gz`)
  );
  console.log("All ok!");
}

module.exports = { verify };
