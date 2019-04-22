import inquirer from "inquirer";
import {
  fetchFileListing,
  fetchYearListings,
  parseFileNames,
  getLatestVersion
} from "../bucket";
import * as logger from "../util/logger";

async function getYear() {
  const years = await fetchYearListings();

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

  const files = await fetchFileListing(`data/${year}/`);
  const versions = parseFileNames(files);

  const { version } = await inquirer.prompt([
    {
      name: "version",
      type: "list",
      choices: Object.keys(versions)
    }
  ]);

  return version;
}

export default async function getVersionFromArgv(argv) {
  let version = argv["target-version"];

  if (argv.latest) {
    version = await getLatestVersion();
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
}
