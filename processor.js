const XMLParser = require("./processing/XMLParser");
const localDumps = require("./localDumps");
const fs = require("fs-extra");

class ProcessingError extends Error {
  constructor(message, rows) {
    super(message);

    this.message = message;
    this.rows = rows;
  }
}

function logInvalidRow(logPath, type, invalidRow) {
  fs.appendFileSync(
    logPath,
    `[${new Date().toISOString()}] Could not process ${type} with id ${
      invalidRow.id
    }: node ${invalidRow.reason}\n           ${invalidRow.json}\n\n`
  );
}

function processFile(
  { path, gz },
  type,
  fn,
  chunkSize = 100,
  restart = false,
  maxErrors = 100
) {
  return new Promise(resolve => {
    const progressFilePath = `${path}.processing`;
    const logPath = `${path}.log`;

    console.log(`Processing ${path}...`);

    let toSkip = 0;
    let processed = 0;
    if (fs.existsSync(progressFilePath) && !restart) {
      toSkip = parseInt(
        fs.readFileSync(progressFilePath, { encoding: "utf8" }),
        10
      );
      console.log(`some rows were already processed: skipping first ${toSkip}`);
    }

    const reader = new XMLParser(path, 1, { gzip: gz });

    let oldChunk = new Array(chunkSize);
    let newChunk = new Array(chunkSize);
    let chunkIndex = 0;

    let numInvalid = 0;

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
            .then(invalidRows => {
              numInvalid += invalidRows.length;

              for (const invalidRow of invalidRows) {
                logInvalidRow(logPath, type, invalidRow);
              }

              if (numInvalid > maxErrors) {
                throw new Error(
                  `More than ${maxErrors} ${type} failed to insert. Aborting processing.`
                );
              }

              fs.writeFileSync(progressFilePath, processed.toString(), {
                encoding: "utf8"
              });
              console.log(`${processed} rows processed`);
              reader.resume();
            })
            .catch(e => {
              console.log(`Error while processing: ${e.stack}`);
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
          fs.removeSync(progressFilePath);
          resolve();
        });
    });
  });
}

async function processDumps(
  version,
  types = localDumps.DATA_TYPES,
  fn,
  chunkSize = 100,
  restart = false,
  dataDir,
  maxErrors = 100
) {
  const targetFiles = localDumps.findData(version, types, dataDir);

  for (let i = 0; i < targetFiles.length; i++) {
    if (!targetFiles[i]) {
      throw new Error(`No ${types[i]} found for version "${version}"`);
    }

    await processFile(
      targetFiles[i],
      types[i],
      fn,
      chunkSize,
      restart,
      maxErrors
    );
  }
}

module.exports = { processDumps };
