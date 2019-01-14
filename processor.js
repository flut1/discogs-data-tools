const bigXml = require("big-xml");
const localDumps = require("./localDumps");

const recordRegex = {
  masters: /^master$/,
  artists: /^artist$/,
  labels: /^label$/,
  releases: /^release$/,
};

function processFile({ path, gz }, type) {
  return new Promise((resolve) => {
    const reader = bigXml.createReader(path, recordRegex[type], {
      gzip: gz
    });

    reader.on('record', function(record) {
      console.log(record);
    });

    reader.on('end', () => {
      resolve();
    });
  });
}

async function processDumps(version, types = localDumps.DATA_TYPES) {
  const targetFiles = localDumps.findData(version, types);

  for (let i = 0; i < targetFiles.length; i++) {
    if (!targetFiles[i]) {
      throw new Error(`No ${types[i]} found for version "${version}"`);
    }

    await processFile(targetFiles[i], types[i]);
  }
}

module.exports = { processDumps };
