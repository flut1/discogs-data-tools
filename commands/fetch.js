const inquirer = require("inquirer");
const remoteDumps = require("../remoteDumps");
const localDumps = require("../localDumps");
const fetcher = require("../fetcher");
const { verify } = require("../verify");

async function main(argv) {
  async function getYear() {
    const years = await remoteDumps.fetchYearListings();

    const { year } = await inquirer.prompt([
      {
        name: "year",
        type: "list",
        choices: years.map(l => l.year.toString())
      }
    ]);

    return year;
  }

  async function getVersion() {
    let year = argv.year;

    if (!year) {
      year = await getYear();
    }

    const files = await remoteDumps.fetchFileListing(`data/${year}/`);
    const versions = remoteDumps.parseFileNames(files);

    const { version } = await inquirer.prompt([
      {
        name: "version",
        type: "list",
        choices: Object.keys(versions)
      }
    ]);

    return version;
  }

  let version = argv['dump-version'];

  if (argv.latest) {
    const years = await remoteDumps.fetchYearListings();
    const files = await remoteDumps.fetchFileListing(years[0].path);
    const versions = remoteDumps.parseFileNames(files);

    const versionNames = Object.keys(versions).map(v => parseInt(v, 10));
    versionNames.sort((a, b) => (b - a));

    version = versionNames[0].toString();
    console.log(`Latest version is "${version}"`);
  }

  if (!version) {
    try {
      version = await getVersion();
    } catch (e) {
      throw new Error(
        `Could not get version: \n${
          e.stack
        }\nConsider manually passing a version using the --dumpVersion arg`
      );
    }
  }

  const existingData = localDumps.findData(version, argv.types, argv['data-dir']);
  const typesToDownload = argv.types.filter(
    (_, index) => !existingData[index]
  );
  if (existingData.some(d => !d)) {
    console.log(
      `Some data is not yet downloaded: ${typesToDownload.join(', ')}`
    );

    await fetcher.ensureDumps(version, argv.types, !argv['no-progress'], argv['data-dir']);
  } else {
    console.log('All data downloaded');
  }

  if (!argv['no-verify']) {
    try {
      await verify(version, typesToDownload, argv['data-dir']);
    } catch(e) {
      console.error('WARNING: verification failed! File might be invalid:');
      console.error(e);
    }
  }
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
