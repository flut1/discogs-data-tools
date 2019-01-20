const fs = require("fs-extra");
const request = require("request");
const cliProgress = require("cli-progress");
const progress = require("request-progress");
const path = require("path");
const localDumps = require("./localDumps");
const remoteDumps = require("./remoteDumps");
const createExitHandler = require("./util/createExitHandler");
const { COLLECTIONS, DEFAULT_DATA_DIR } = require("./constants");

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
    const url = remoteDumps.getDumpURL(version, collection);
    const targetPath = localDumps.getXMLPath(
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
      .on("progress", function(state) {
        if (showProgress) {
          if (!started) {
            bar.start(state.size.total, 0);
            started = true;
          } else {
            bar.update(state.size.transferred);
          }
        }
      })
      .on("error", function(err) {
        if (showProgress) {
          bar.stop();
        }
        removeExitHandler();
        reject(new Error(`Error getting dump: ${err}`));
      })
      .on("end", function() {
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
function ensureDump(
  version,
  collection,
  showProgress = false,
  dataDir = DEFAULT_DATA_DIR
) {
  const [existingData] = localDumps.findData(version, [collection], dataDir);

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
async function ensureDumps(
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
 * @returns {Promise<void>}
 */
async function ensureChecksum(version, dataDir = DEFAULT_DATA_DIR) {
  const checksumPath = localDumps.getChecksumPath(version, dataDir);

  if (fs.existsSync(checksumPath)) {
    console.log(`Checksum file exists at ${checksumPath}`);
  } else {
    const url = remoteDumps.getChecksumURL(version);
    fs.ensureDirSync(path.dirname(checksumPath));
    console.log(`Fetching ${url}`);

    await new Promise((resolve, reject) => {
      request(url)
        .on("error", function(err) {
          reject(new Error(`Error getting checksum file: ${err}`));
        })
        .on("end", function() {
          console.log("Checksum file fetched");
          resolve();
        })
        .pipe(fs.createWriteStream(checksumPath));
    });
  }

  return checksumPath;
}

module.exports = { ensureDump, ensureDumps, ensureChecksum };
