const fs = require('fs-extra');
const request = require('request');
const cliProgress = require('cli-progress');
const progress = require('request-progress');
const path = require('path');
const dataManager = require('./dataManager');
const listings = require('./listings');

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
        // The state is an object that looks like this:
        // {
        //     percent: 0.5,               // Overall percent (between 0 to 1)
        //     speed: 554732,              // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,        // The total payload size in bytes
        //         transferred: 27610959   // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
        //     }
        // }
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

function ensureDump(version, type) {
  const [existingData] = dataManager.findData(version, [type]);

  if (!existingData) {
    return fetchDump(version, type);
  }
  console.log(`${type} already downloaded. skipping...`);
  return Promise.resolve();
}

async function ensureDumps(version, types = dataManager.DATA_TYPES) {
  for (const type of types) {
    await ensureDump(version, type);
  }
}

module.exports = { ensureDump, ensureDumps };