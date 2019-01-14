const processor = require('../processor');

async function main(argv) {
  await processor.processDumps(argv.dumpVersion, argv.types);
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
