const yargs = require("yargs");
const { COLLECTIONS } = require("./constants");

module.exports = yargs
  .options({
    'data-dir': {
      alias: "d",
      describe: "Root directory where dumps and related files are stored.",
      default: "./data",
      type: "string"
    },
    "target-version": {
      alias: "t",
      describe: "Full name of the target dump version. ie: 20180101",
      type: "string"
    },
    "interactive": {
      alias: "i",
      describe: "Interactively select the target dump version",
      type: "boolean"
    },
    latest: {
      alias: "l",
      describe: "Automatically select the latest version",
      type: "boolean"
    },
    collections: {
      alias: "c",
      describe: "Select which collections to target. If not given, will target all",
      choices: COLLECTIONS,
      type: "array"
    }
  })
  .conflicts('l', 'i')
  .conflicts('l', 't')
  .conflicts('i', 't')
  .command(
    "fetch",
    "Fetch data dump from discogs",
    y => {
      return y
        .options({
          "no-progress": {
            alias: "n",
            describe: "Don't show a progress bar",
            type: "boolean"
          },
          "no-verify": {
            describe: "Skip verifying the dumps with the checksum provided by Discogs",
            type: "boolean"
          },
        })
        .example("$0 fetch --target-version 20180101 --collections labels masters");
    },
    argv => {
      require("./commands/fetch")(argv);
    }
  )
  .command(
    "verify",
    "Verify dump files that have previously been downloaded. Note: by default, the fetch command already verifies",
    y => {
      return y
        .example("$0 verify --latest")
        .example("$0 verify --target-version 20180101 --collections releases");
    },
    argv => {
      require("./commands/verify")(argv);
    }
  )
  .command(
    "ls",
    "List all downloaded data",
    y => y,
    argv => {
      require("./commands/ls")(argv);
    }
  )
  .command(
    "mongo",
    "import data dump into mongo database",
    y => {
      return y
        .options({
          "chunk-size": {
            alias: "s",
            describe: "Number of rows in processing chunks. Larger size takes more memory.",
            default: 1000,
            type: "number"
          },
          "drop-existing-collection": {
            describe: "Drop a collection if it already exists. Use with caution!",
            type: "boolean"
          },
          "no-index": {
            describe: "Don't create indexes on collections",
            type: "boolean"
          },
          "no-validate": {
            describe: "Skip validation of XML nodes. Can considerably speed up processing, but you may get invalid rows",
            type: "boolean"
          },
          "max-errors": {
            alias: "e",
            describe: "Number of rows that could not be inserted before the command is aborted",
            default: 100,
            type: "number"
          },
          bail: {
            alias: "b",
            describe: "Immediately abort when a validation error occurs or a row failed to persist to the database",
            type: "boolean"
          },
          restart: {
            alias: "r",
            describe: "Don't continue processing from where it last stopped but restart at the first row",
            type: "boolean"
          },
          'database-name': {
            alias: "n",
            describe: "Name of the database to write to",
            default: "discogs",
            type: "string"
          },
          'connection': {
            alias: "o",
            describe: "The MongoDB connection string",
            demand: true,
            type: "string"
          },
          "include-image-objects": {
            describe: "Include image objects. By default, will only include the image count because image objects in data dumps are missing the URI",
            type: "boolean"
          }
        })
        .example("$0 mongo --latest --connection mongodb://root:pw@127.0.0.1:27017")
        .example("$0 mongo --target-version 20180401 --chunk-size 100 --connection mongodb://root:pw@127.0.0.1:27017");
    },
    argv => {
      require("./commands/mongo")(argv);
    }
  )
  .demandCommand(1, 1)
  .usage(
    '$0 <command> [...args]\nFor help on a command run "$0 <command> help"'
  )
  .help().wrap(110).argv;
