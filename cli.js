const yargs = require("yargs");
const DATA_TYPES = require("./localDumps").DATA_TYPES;

module.exports = yargs
  .command(
    "fetch",
    "fetch data dump from discogs",
    y => {
      return y
        .options({
          year: {
            alias: "y",
            describe: "The year to find monthly dumps for.",
            type: "number"
          },
          "noProgress": {
            alias: "np",
            describe: "Hides the progress bar",
            type: "boolean"
          },
          dumpVersion: {
            alias: "dv",
            describe: "Full name of the version to fetch. ie: 20180101",
            type: "string"
          },
          types: {
            alias: "t",
            describe: "List of types to get",
            default: DATA_TYPES,
            choices: DATA_TYPES,
            type: "array"
          }
        })
        .example("$0 fetch --dumpVersion 20180101 --types labels masters")
        .conflicts("year", "version");
    },
    argv => {
      require("./commands/fetch")(argv);
    }
  )
  .command(
    "mongo",
    "import data dump into mongo database",
    y => {
      return y
        .options({
          dumpVersion: {
            alias: "dv",
            describe: "Full name of the version to fetch. ie: 20180101",
            type: "string"
          },
          chunkSize: {
            alias: "cs",
            describe: "Size of processing chunks. Larger size takes more memory",
            default: 1000,
            type: "number"
          },
          noIndex: {
            alias: "ni",
            describe: "Don't create indexes on collections",
            type: "boolean"
          },
          noValidate: {
            alias: "nv",
            describe: "Skip validation of XML nodes. Can considerably speed up processing, but you may get invalid rows",
            type: "boolean"
          },
          restart: {
            alias: "r",
            describe: "Don't continue processing from where it last stopped but restart at the first row",
            type: "boolean"
          },
          includeImageObjects: {
            alias: "i",
            describe: "Include image objects. By default, will only include the image count because image objects in data dumps are missing the URI",
            type: "boolean"
          },
          types: {
            alias: "t",
            describe: "List of types to get",
            default: DATA_TYPES,
            choices: DATA_TYPES,
            type: "array"
          }
        });
    },
    argv => {
      require("./commands/mongo")(argv);
    }
  )
  .demandCommand()
  .usage(
    '$0 <command> [...args]\nFor help on a command run "$0 <command> help"'
  )
  .help().argv;
