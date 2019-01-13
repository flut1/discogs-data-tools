const fs = require('fs-extra');
const request = require('request');
const cliProgress = require('cli-progress');
const progress = require('request-progress');
const path = require('path');
const dataManager = require('./dataManager');
const listings = require('./listings');

/** @module fetcher */

function fetchDump(version, type) {
  return new Promise((resolve, reject) => {
    const url = listings.getDumpURL(version, type);
    const targetPath = dataManager.getXMLPath(version, type, true);
    const bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
    let started = false;
    fs.ensureDirSync(path.dirname(targetPath));
    console.log(`Fetching ${url}`);
    progress(request(url))
      .on('progress', function (state) {
        if (!started) {
          bar.start(state.size.total, 0);
          started = true;
        } else {
          bar.update(state.size.transferred);
        }
      })
      .on('error', function (err) {
        bar.stop();
        reject(new Error(`Error getting dump: ${err}`));
      })
      .on('end', function () {
        bar.stop();
        console.log('Finished');
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
 * @returns {Promise<void>} A Promise that completes when all data is
 * downloaded
 */
function ensureDump(version, type) {
  const [existingData] = dataManager.findData(version, [type]);

  if (!existingData) {
    return fetchDump(version, type);
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
 * @returns {Promise<void>} A Promise that completes when all data is
 * downloaded
 */
async function ensureDumps(version, types = dataManager.DATA_TYPES) {
  for (const type of types) {
    await ensureDump(version, type);
  }
}

module.exports = { ensureDump, ensureDumps };