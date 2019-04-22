import fs from 'fs-extra';
import XMLParser from './XMLParser';
import * as logger from '../util/logger';
import { findData } from '../dataManager';
import { COLLECTIONS, DEFAULT_DATA_DIR } from "../constants";

/**
 * Parse the data dump XML into plain JS objects and process them with
 * a given function. See readme.md for an example
 * @module processing/processor
 */

/**
 * The signature of the `fn` function passed to `processDumpFile`
 * @callback processChunkFn
 * @param chunk {Array<Object>} An array of plain objects as parsed by
 * `node-expat` from XML
 * @param collection {string} The type of collection ("artists", "labels",
 * "masters" or "releases")
 * @param path {string} The path to the dump file that is being
 * processed
 * @returns {Promise} A promise that resolves when processing is complete
 */

/**
 * Processes an XML dump file using `node-expat` into plain objects. Every
 * `chunkSize` rows the parser will pause and pass the result to the `fn`
 * function. Once the `fn` function completes, parsing continues until the
 * entire file is parsed.
 *
 * @param path {string} The full path to the file to process
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param fn {processChunkFn} The function to call on each
 * chunk of data.
 * @param [gz=true] {boolean} A boolean indicating if the dump is compressed
 * in gzip format
 * @param [chunkSize=1000] {number} The number of XML rows that are parsed by
 * `node-expat` until `fn` is called. A bigger number may be more efficient,
 * but costs more memory
 * @param [restart=false] {boolean} By default, the processing progress is
 * stored in a `.processing` file alongside the data dumps. If the processing
 * is stopped, it will continue from that row once you call `processDumpFile`
 * again. Set this to `true` to always start from the beginning.
 * @returns {Promise} A Promise that resolves when processing is complete
 * @example ```
 * processDumpFile(
 *   './discogs_20190101_artists.xml.gz',
 *   'artists',
 *   chunk => {
 *      // process the results here. For this example, we just console.log them
 *      chunk.forEach(row => console.log(row));
 *
 *      return Promise.resolve();
 *   }
 * );
 * ```
 */
export function processDumpFile(
  path,
  collection,
  fn,
  gz = true,
  chunkSize = 1000,
  restart = false
) {
  return new Promise((resolve, reject) => {
    const progressFilePath = `${path}.processing`;

    let toSkip = 0;
    let processed = 0;
    if (fs.existsSync(progressFilePath) && !restart) {
      toSkip = parseInt(
        fs.readFileSync(progressFilePath, { encoding: "utf8" }),
        10
      );
      logger.status(`some rows were already processed: skipping first ${toSkip}`, true);
    }

    const reader = new XMLParser(path, 1, { gzip: gz });

    let oldChunk = new Array(chunkSize);
    let newChunk = new Array(chunkSize);
    let chunkIndex = 0;

    reader.on("record", record => {
      if (processed >= toSkip) {
        newChunk[chunkIndex] = record;
        chunkIndex++;

        if (chunkIndex >= chunkSize) {
          chunkIndex = 0;
          reader.pause();
          const tmp = oldChunk;
          oldChunk = newChunk;
          newChunk = tmp;

          Promise.resolve()
            .then(() => fn(oldChunk, collection, path))
            .then(() => {
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
            return fn(newChunk.slice(0, chunkIndex), collection, path);
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

/**
 * Looks up the downloaded data dumps of a given version. Then calls `processDumpFile`
 * on each of them.
 * @see processDumpFile
 * @param version {string}
 * @param fn {function}
 * @param [collections] {Array<string>}
 * @param [chunkSize=1000] {number}
 * @param [restart=false] {boolean}
 * @param [dataDir='/data'] {string}
 * @returns {Promise<void>}
 */
export async function processDumps(
  version,
  fn,
  collections = COLLECTIONS,
  chunkSize = 1000,
  restart = false,
  dataDir = DEFAULT_DATA_DIR
) {
  const targetFiles = findData(version, collections, dataDir);

  for (let i = 0; i < targetFiles.length; i++) {
    if (!targetFiles[i]) {
      throw new Error(`No ${collections[i]} found for version "${version}"`);
    }

    logger.log(`Processing ${targetFiles[i].path}...`);
    await processDumpFile(
      targetFiles[i].path,
      collections[i],
      fn,
      targetFiles[i].gz,
      chunkSize,
      restart
    );
    logger.succeed(`Finished processing ${targetFiles[i].path}...`);
  }
}
