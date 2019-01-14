const processor = require('../processor');

async function main(argv) {
  let c=0;
  async function processEntries(chunk, type) {
    c++;
    console.log(chunk[0]);
  }

  await processor.processDumps(argv.dumpVersion, argv.types, processEntries, argv.chunkSize);
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
