const fs = require("fs-extra");
const request = require("request");
const cliProgress = require("cli-progress");
const progress = require("request-progress");
const path = require("path");
const dataManager = require("./dataManager");
const createExitHandler = require("./util/createExitHandler");

/**
 * Get the URL for a specific data dump
 * @param version {string} The exact version name, eg '20180101'
 * @param type {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @returns {string}
 */
function getDumpURL(version, type) {
  return `https://discogs-data.s3-us-west-2.amazonaws.com/data/${version.substring(
    0,
    4
  )}/discogs_${version}_${type}.xml.gz`;
}

/**
 * Util functions to download data dumps and show download progress
 * @module fetcher
 */

function fetchDump(version, type, showProgress = false) {
  return new Promise((resolve, reject) => {
    const url = getDumpURL(version, type);
    const targetPath = dataManager.getXMLPath(version, type, true);
    const bar = showProgress
      ? new cliProgress.Bar({}, cliProgress.Presets.shades_classic)
      : null;
    let started = false;
    fs.ensureDirSync(path.dirname(targetPath));
    console.log(`Fetching ${url}`);

    const removeExitHandler = createExitHandler(() => {
      console.log('Download cancelled. Removing file');
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
 * @param type {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [showProgress=false] {boolean} Show a progress indicator. For
 * usage in an interactive CLI. On a server you probably want this set to
 * false
 * @returns {Promise<void>} A Promise that completes when all data is
 * downloaded
 */
function ensureDump(version, type, showProgress = false) {
  const [existingData] = dataManager.findData(version, [type]);

  if (!existingData) {
    return fetchDump(version, type, showProgress);
  }
  console.log(`${type} already downloaded. skipping...`);
  return Promise.resolve();
}

/**
 * Ensures all the specified types for a specific data dump version are
 * downloaded to ./data/<version>/
 * @param version {string} The exact version name, eg '20180101'
 * @param [types] {string[]} An array of types to get. Possible options:
 * "artists", "labels", "masters" or "releases".  Defaults to all types
 * @param [showProgress=false] {boolean} Show a progress indicator. For
 * usage in an interactive CLI. On a server you probably want this set to
 * false
 * @returns {Promise<void>} A Promise that completes when all data is
 * downloaded
 */
async function ensureDumps(
  version,
  types = dataManager.DATA_TYPES,
  showProgress = false
) {
  for (const type of types) {
    await ensureDump(version, type, showProgress);
  }
}

module.exports = { ensureDump, ensureDumps, getDumpURL };
