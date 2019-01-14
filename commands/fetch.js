const inquirer = require("inquirer");
const remoteDumps = require("../remoteDumps");
const localDumps = require("../localDumps");
const fetcher = require("../fetcher");

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

  let version = argv.dumpVersion;

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

  const existingData = localDumps.findData(version, argv.types);
  if (existingData.some(d => !d)) {
    console.log(
      `Some data is not yet downloaded: ${argv.types.filter(
        (_, index) => !existingData[index]
      ).join(', ')}`
    );

    await fetcher.ensureDumps(version, argv.types, !argv.noProgress);
  } else {
    console.log('All data downloaded');
  }
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
