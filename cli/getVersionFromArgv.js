const inquirer = require("inquirer");
const bucket = require("../bucket");
const logger = require("../util/logger");

async function getYear() {
  const years = await bucket.fetchYearListings();

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

  const files = await bucket.fetchFileListing(`data/${year}/`);
  const versions = bucket.parseFileNames(files);

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
    version = await bucket.getLatestVersion();
    logger.succeed(`Latest version is "${version}"`);
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
