import fs from 'fs-extra';
import request from 'request';
import cliProgress from 'cli-progress';
import progress from 'request-progress';
import path from 'path';
import { getXMLPath, getChecksumPath, findData } from './dataManager';
import { getDumpURL, getChecksumURL } from './bucket';
import createExitHandler from './util/createExitHandler';
import { COLLECTIONS, DEFAULT_DATA_DIR } from "./constants";

/**
 * Download data dumps and show download progress
 * @module fetcher
 */

function fetchDump(
  version,
  collection,
  showProgress = false,
  dataDir = DEFAULT_DATA_DIR
) {
  return new Promise((resolve, reject) => {
    const url = getDumpURL(version, collection);
    const targetPath = getXMLPath(
      version,
      collection,
      true,
      dataDir
    );
    const bar = showProgress
      ? new cliProgress.Bar({}, cliProgress.Presets.shades_classic)
      : null;
    let started = false;
    fs.ensureDirSync(path.dirname(targetPath));
    console.log(`Fetching ${url}`);

    const removeExitHandler = createExitHandler(() => {
      console.log("Download cancelled. Removing file");
      fs.removeSync(targetPath);
    });

    progress(request(url))
      .on("progress", (state) => {
        if (showProgress) {
          if (!started) {
            bar.start(state.size.total, 0);
            started = true;
          } else {
            bar.update(state.size.transferred);
          }
        }
      })
      .on("error", (err) => {
        if (showProgress) {
          bar.stop();
        }
        removeExitHandler();
        reject(new Error(`Error getting dump: ${err}`));
      })
      .on("end", () => {
        if (showProgress) {
          bar.stop();
        }
        removeExitHandler();
        console.log("Finished");
        resolve();
      })
      .pipe(fs.createWriteStream(targetPath));
  });
}

/**
 * Ensures a data dump file is downloaded to ./data/<version>/. Does
 * nothing if a file already exists. Does not verify the file.
 * @param version {string} The exact version name, eg '20180101'
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [showProgress=false] {boolean} Show a progress indicator. For
 * usage in an interactive CLI. On a server you probably want this set to
 * false
 * @param [dataDir] {string} Set to overwrite the default data directory
 * where dumps are stored (./data)
 * @returns {Promise<void>} A Promise that completes when all data is
 * downloaded
 */
export function ensureDump(
  version,
  collection,
  showProgress = false,
  dataDir = DEFAULT_DATA_DIR
) {
  const [existingData] = findData(version, [collection], dataDir);

  if (!existingData) {
    return fetchDump(version, collection, showProgress, dataDir);
  }
  console.log(`${collection} already downloaded. skipping...`);
  return Promise.resolve();
}

/**
 * Ensures all the specified collections of a specific data dump version are
 * downloaded to the given data directory
 * @param version {string} The exact version name, eg '20180101'
 * @param [collections] {string[]} An array of types to get. Possible options:
 * "artists", "labels", "masters" or "releases".  Defaults to all types
 * @param [showProgress=false] {boolean} Show a progress indicator. For
 * usage in an interactive CLI. On a server you probably want this set to
 * false
 * @param [dataDir] {string} Set to overwrite the default data directory
 * where dumps are stored (./data)
 * @returns {Promise<void>} A Promise that completes when all data is
 * downloaded
 */
export async function ensureDumps(
  version,
  collections = COLLECTIONS,
  showProgress = false,
  dataDir = DEFAULT_DATA_DIR
) {
  for (const collection of collections) {
    await ensureDump(version, collection, showProgress, dataDir);
  }
}

/**
 * Ensures that the CHECKSUM file for a given version is downloaded
 * @param version {string} The exact version name, eg '20180101'
 * @param [dataDir] {string} Set to overwrite the default data directory
 * where dumps are stored (./data)
 * @returns {Promise<string>}
 */
export async function ensureChecksum(version, dataDir = DEFAULT_DATA_DIR) {
  const checksumPath = getChecksumPath(version, dataDir);

  if (fs.existsSync(checksumPath)) {
    console.log(`Checksum file exists at ${checksumPath}`);
  } else {
    const url = getChecksumURL(version);
    fs.ensureDirSync(path.dirname(checksumPath));
    console.log(`Fetching ${url}`);

    await new Promise((resolve, reject) => {
      request(url)
        .on("error", (err) => {
          reject(new Error(`Error getting checksum file: ${err}`));
        })
        .on("end", () => {
          console.log("Checksum file fetched");
          resolve();
        })
        .pipe(fs.createWriteStream(checksumPath));
    });
  }

  return checksumPath;
}
