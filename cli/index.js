#!/usr/bin/env node
const yargs = require("yargs");
const { stream } = require("../index");
const wrapCommand = require("./wrapCommand");

module.exports = yargs
  .strict()
  .command(
    "stream",
    "Stream a data dump from discogs and directly process it into your database",
    (y) =>
      y
        .options({
            "dump-version": {
                alias: "d",
                type: "string",
            },
            progress: {
                alias: "p",
                type: "boolean",
            },
        })
        .usage("$0 test <target> [...args]")
        .example("$0 stream"),
    wrapCommand("stream", stream)
  )
  .help()
  .wrap(yargs.terminalWidth() || 110).argv;
