const fs = require("fs-extra");
const XMLParser = require("./processing/XMLParser");
const logger = require("./util/logger");
const localDumps = require("./localDumps");
const { COLLECTIONS } = require("./constants");

class ProcessingError extends Error {
  constructor(message, rows) {
    super(message);

    this.message = message;
    this.rows = rows;
  }
}

function logInvalidRow(logPath, type, invalidRow) {
  const mssg = `Could not process ${type} with id ${invalidRow.id}: node ${
    invalidRow.reason
  }`;

  logger.warn(mssg);
  fs.appendFileSync(
    logPath,
    `[${new Date().toISOString()}] ${mssg}\n           ${invalidRow.json}\n\n`
  );
}

function processFile(
  { path, gz },
  collection,
  fn,
  chunkSize = 100,
  restart = false,
  maxErrors = 100
) {
  return new Promise((resolve, reject) => {
    const progressFilePath = `${path}.processing`;
    const logPath = `${path}.log`;

    let toSkip = 0;
    let processed = 0;
    if (fs.existsSync(progressFilePath) && !restart) {
      toSkip = parseInt(
        fs.readFileSync(progressFilePath, { encoding: "utf8" }),
        10
      );
      logger.log(`some rows were already processed: skipping first ${toSkip}`);
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
            .then(() => fn(oldChunk, collection))
            .then(invalidRows => {
              numInvalid += invalidRows.length;

              for (const invalidRow of invalidRows) {
                logInvalidRow(logPath, collection, invalidRow);
              }

              if (numInvalid > maxErrors) {
                throw new Error(
                  `More than ${maxErrors} ${collection} failed to insert. Aborting processing.`
                );
              }

              fs.writeFileSync(progressFilePath, processed.toString(), {
                encoding: "utf8"
              });

              logger.status(`${processed} rows processed`);
              reader.resume();
            })
            .catch(e => {
              reader.close();
              reject(e);
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
            logger.status("processing last chunk...");
            return fn(newChunk.slice(0, chunkIndex), collection);
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
  collections = COLLECTIONS,
  fn,
  chunkSize = 100,
  restart = false,
  dataDir,
  maxErrors = 100
) {
  const targetFiles = localDumps.findData(version, collections, dataDir);

  for (let i = 0; i < targetFiles.length; i++) {
    if (!targetFiles[i]) {
      throw new Error(`No ${collections[i]} found for version "${version}"`);
    }

    logger.log(`Processing ${targetFiles[i].path}...`);
    await processFile(
      targetFiles[i],
      collections[i],
      fn,
      chunkSize,
      restart,
      maxErrors
    );
    logger.succeed(`Finished processing ${targetFiles[i].path}...`);
  }
}

module.exports = { processDumps };
