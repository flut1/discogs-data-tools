const inquirer = require("inquirer");
const remoteDumps = require("../remoteDumps");

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

async function getVersionInteractive() {
  const year = await getYear();

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

module.exports = async function getVersionFromArgv(argv) {
  let version = argv["target-version"];

  if (argv.latest) {
    const years = await remoteDumps.fetchYearListings();
    const files = await remoteDumps.fetchFileListing(years[0].path);
    const versions = remoteDumps.parseFileNames(files);

    const versionNames = Object.keys(versions).map(v => parseInt(v, 10));
    versionNames.sort((a, b) => b - a);

    version = versionNames[0].toString();
    console.log(`Latest version is "${version}"`);
  }

  if (!version) {
    if (!argv.interactive) {
      throw new Error(
        "No target version specified in arguments. \nExpected either --interactive, --target-version or --latest arguments to be set.\nRun the help command for more information"
      );
    }

    try {
      version = await getVersionInteractive();
    } catch (e) {
      throw new Error(
        `Could not get version: \n${
          e.stack
        }\nConsider manually passing a version using the --target-version arg`
      );
    }
  }

  return version;
};
