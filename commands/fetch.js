const localDumps = require("../localDumps");
const fetcher = require("../fetcher");
const { verify } = require("../verify");
const { COLLECTIONS } = require('../constants');
const getVersionFromArgv = require('../util/getVersionFromArgv');

async function main(argv) {
  const version = await getVersionFromArgv(argv);

  const collections = argv.collections || COLLECTIONS;
  const existingData = localDumps.findData(version, collections, argv['data-dir']);
  const collectionsToDownload = collections.filter(
    (_, index) => !existingData[index]
  );
  if (existingData.some(d => !d)) {
    console.log(
      `Some data is not yet downloaded: ${collectionsToDownload.join(', ')}`
    );

    await fetcher.ensureDumps(version, collections, !argv['hide-progress'], argv['data-dir']);
  } else {
    console.log('All data downloaded');
  }

  if (!argv['skip-verification']) {
    try {
      await verify(version, collectionsToDownload, argv['data-dir']);
    } catch(e) {
      console.error('WARNING: verification failed! File might be invalid:');
      console.error(e);
    }
  }
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
