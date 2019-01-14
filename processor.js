const XMLReader = require("./XMLReader");
const localDumps = require("./localDumps");
const fs = require("fs-extra");

const recordRegex = {
  masters: /^master$/,
  artists: /^artist$/,
  labels: /^label$/,
  releases: /^release$/
};

function processFile({ path, gz }, type, fn, chunkSize = 100) {
  return new Promise(resolve => {
    const progressFilePath = `${path}.processing`;

    console.log(`Processing ${path}...`);

    let toSkip = 0;
    let processed = 0;
    if (fs.existsSync(progressFilePath)) {
      toSkip = parseInt(
        fs.readFileSync(progressFilePath, { encoding: "utf8" }),
        10
      );
      console.log(`some rows were already processed: skipping first ${toSkip}`);
    }

    const reader = new XMLReader(path, 1, { gzip: gz });

    let oldChunk = new Array(chunkSize);
    let newChunk = new Array(chunkSize);
    let chunkIndex = 0;

    reader.on("record", function(record) {
      if (processed >= toSkip) {
        newChunk[chunkIndex] = record;
        chunkIndex++;

        if (chunkIndex >= chunkSize) {
          chunkIndex = 0;
          reader.pause();
          let tmp = oldChunk;
          oldChunk = newChunk;
          newChunk = tmp;

          Promise.resolve()
            .then(() => fn(oldChunk, type))
            .then(() => {
              fs.writeFileSync(progressFilePath, processed.toString(), {
                encoding: "utf8"
              });
              console.log(`${processed} rows processed`);
              reader.resume();
            })
            .catch(e => {
              console.log(`Error while processing: ${e}`);
              console.log("aborting...");
              resolve();
            });
        }
      }

      processed++;
    });

    reader.on("end", () => {
      Promise.resolve()
        .then(() => {
          if (chunkIndex > 0) {
            // flush remaining
            return fn(newChunk.slice(0, chunkIndex), type);
          }
          return Promise.resolve();
        })
        .then(() => {
          resolve();
        });
    });
  });
}

async function processDumps(
  version,
  types = localDumps.DATA_TYPES,
  fn,
  chunkSize = 100
) {
  const targetFiles = localDumps.findData(version, types);

  for (let i = 0; i < targetFiles.length; i++) {
    if (!targetFiles[i]) {
      throw new Error(`No ${types[i]} found for version "${version}"`);
    }

    await processFile(targetFiles[i], types[i], fn, chunkSize);
  }
}

module.exports = { processDumps };
