#!/usr/bin/env node
const yargs = require("yargs");
const { COLLECTIONS } = require("../constants");

module.exports = yargs
  .strict()
  .options({
    "data-dir": {
      alias: "d",
      describe: "Root directory where dumps and related files are stored.",
      default: "./data",
      type: "string"
    },
    "target-version": {
      alias: "t",
      describe:
        'Manually pass the name of the target dump version. ie: "20180101"',
      type: "string"
    },
    interactive: {
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
      describe:
        "Select which collections to target. If not given, will target all",
      choices: COLLECTIONS,
      type: "array"
    }
  })
  .group(["interactive", "latest", "target-version"], "Target (one required):")
  .conflicts("l", "i")
  .conflicts("l", "t")
  .conflicts("i", "t")
  .command(
    "fetch",
    "Fetch data dump files from Discogs.",
    y =>
      y
        .options({
          "hide-progress": {
            alias: "n",
            describe: "Don't show a progress bar",
            type: "boolean"
          },
          "skip-verify": {
            describe:
              "Skip verifying the dumps with the checksum provided by Discogs",
            type: "boolean"
          }
        })
        .usage("$0 fetch <target> [...args]")
        .example(
          "$0 fetch --target-version 20180101 --collections labels masters"
        ),
    argv => {
      require("../cli/fetch")(argv);
    }
  )
  .command(
    "verify",
    "Verify dump files that have previously been downloaded. " +
      "This uses the checksum available on the website. " +
      "Note: by default, the 'fetch' command already verifies",
    y =>
      y
        .usage("$0 verify <target> [...args]")
        .example("$0 verify --latest")
        .example("$0 verify --target-version 20180101 --collections releases"),
    argv => {
      require("../cli/verify")(argv);
    }
  )
  .command(
    "ls",
    "List all downloaded data",
    y => y.usage("$0 ls <target> [...args]"),
    argv => {
      require("../cli/ls")(argv);
    }
  )
  .command(
    "mongo",
    "Import data dumps into a mongo database. " +
      "Dumps should already have been downloaded using the 'fetch' command. " +
      "Each '.xml.gz' file of the data dumps are stored in their own MongoDB collection. " +
      "By default, will also create some indexes on the new collections.",
    y =>
      y
        .epilogue(
          "IMPORTANT: please note that existing documents in MongoDB collections " +
            "with the same name will be replaced"
        )
        .options({
          "chunk-size": {
            alias: "s",
            describe:
              "Number of rows in processing chunks. Larger size takes more memory.",
            default: 1000,
            type: "number"
          },
          "drop-existing-collection": {
            describe:
              "Drop a collection if it already exists. Use with caution!",
            type: "boolean"
          },
          silent: {
            alias: "m",
            describe: "Mute all console output",
            type: "boolean"
          },
          indexes: {
            default: true,
            describe: "Create indexes on collections",
            type: "boolean"
          },
          "skip-validation": {
            describe:
              "Skip validation of XML nodes. " +
              "Can considerably speed up processing, but you may get invalid rows",
            type: "boolean"
          },
          "validate-docs": {
            describe:
              "perform additional validation on the objects after they" +
              "have been formatted. Used for development, not necessary on usage",
            type: "boolean"
          },
          "max-errors": {
            alias: "e",
            describe:
              "Number of rows that could not be inserted before the command is aborted",
            default: 100,
            type: "number"
          },
          bail: {
            alias: "b",
            describe:
              "Immediately abort when a validation error occurs or a row failed to persist to the database",
            type: "boolean"
          },
          restart: {
            alias: "r",
            describe:
              "Don't continue processing from where it last stopped but restart at the first row",
            type: "boolean"
          },
          "database-name": {
            alias: "n",
            describe: "Name of the database to write to",
            default: "discogs",
            type: "string"
          },
          connection: {
            alias: "o",
            describe: "The MongoDB connection string",
            demand: true,
            type: "string"
          },
          "include-image-objects": {
            describe:
              "Include image objects. By default, will only include the image count " +
              "because image objects in data dumps are missing the URI",
            type: "boolean"
          }
        })
        .usage("$0 mongo <target> [...args]")
        .example(
          "$0 mongo --no-indexes --latest --connection mongodb://root:pw@127.0.0.1:27017"
        )
        .example(
          "$0 mongo --target-version 20180401 --restart --connection mongodb://root:pw@localhost:27017"
        ),
    argv => {
      require("../cli/mongo")(argv);
    }
  )
  .demandCommand(1, 1)
  .updateStrings({ "Options:": "Optional args:" })
  .usage(
    '$0 <command> <target> [...args]\nFor help on a command run "$0 <command> help"'
  )
  .help()
  .wrap(yargs.terminalWidth() || 110).argv;
