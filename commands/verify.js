const { verify } = require("../verify");
const localDumps = require("../localDumps");

module.exports = function(argv) {
  const dumpFiles = localDumps.findData(argv["dump-version"], argv.types, argv['data-dir']);

  for (let i = 0; i < dumpFiles.length; i++) {
    if (!dumpFiles[i]) {
      console.error(`No dump file found for ${argv["dump-version"]} ${argv.types[i]}`);
      return;
    }
  }

  verify(argv["dump-version"], argv["types"], argv["data-dir"]).catch(e =>
    console.error(e)
  );
};
