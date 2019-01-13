const yargs = require("yargs");
const DATA_TYPES = require("./dataManager").DATA_TYPES;

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
  .demandCommand()
  .usage(
    '$0 <command> [...args]\nFor help on a command run "$0 <command> help"'
  )
  .help().argv;