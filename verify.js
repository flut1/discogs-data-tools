const path = require("path");
const sumchecker = require("sumchecker");
const { ensureChecksum } = require("./fetcher");

async function verify(version, types, dataDir) {
  const checksumPath = await ensureChecksum(version, dataDir);

  console.log('Verifying with checksum...');
  await sumchecker(
    "sha256",
    checksumPath,
    path.resolve(dataDir, version),
    types.map(type => `discogs_${version}_${type}.xml.gz`)
  );
  console.log('All ok!');
}

module.exports = { verify };
