const processor = require('../processor');

async function main(argv) {
  let c=0;
  async function processEntries(chunk, type) {
    console.log(type, chunk.length);
    c++;

    if (c > 4) {
      throw new Error('ending');
    }
  }

  await processor.processDumps(argv.dumpVersion, argv.types, processEntries, argv.chunkSize);
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
