const { verify } = require("../verify");
const localDumps = require("../localDumps");
const getVersionFromArgv = require("../util/getVersionFromArgv");
const { COLLECTIONS } = require('../constants');

module.exports = async function(argv) {
  const collections = argv.collections || COLLECTIONS;
  const version = await getVersionFromArgv(argv);
  const dumpFiles = localDumps.findData(version, collections, argv['data-dir']);

  for (let i = 0; i < dumpFiles.length; i++) {
    if (!dumpFiles[i]) {
      console.error(`No dump file found for ${version} ${collections[i]}`);
      return;
    }
  }

  verify(version, collections, argv["data-dir"]).catch(e =>
    console.error(e)
  );
};
