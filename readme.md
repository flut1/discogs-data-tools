# Discogs Data Tools
Some utilities to download and process Discogs monthly data dumps.

- Download data dumps from Discogs
- Verify data dumps with checksum
- Validate and normalize XML data in data dumps to plain objects
- Store entities in MongoDB collections

You can use the NodeJS API if you want to decide what to do with the
formatted JS objects yourself, instead of writing them to a MongoDB database.
See [Node.JS API](#nodejs-api) below for an example.

**This module is not officially affiliated with Discogs.** For license information on Discogs
data dumps see: https://data.discogs.com/

## Motivation
Discogs has a great API, but in some cases the way the data is structured makes it difficult to look
up information without making too many API calls. That's why the monthly data dumps are very useful:
you can structure and query the data according to the needs of your application. However, parsing the
large and at some points somewhat inconsistent XML dumps into a database is not a trivial task.
This tool is meant to help out with that.

## Installation

- Install Node.JS (min 8.2.1)
- Some dependencies are built using `node-gyp`, which has additional prerequisites. See the [node-gyp documentation](https://github.com/nodejs/node-gyp#Installation) for more info.
- Depending on your use case:
  - To use the NodeJS API in your own node application run `npm install --save disogs-data-tools`
  - To install the tool for global usage run `npm install -g discogs-data-tools`
  - Run the tool directly using npx (see [CLI Usage](#CLI-usage) below)

## Data transformation
Data from the database will be transformed when using the `mongo` CLI command or when formatting using
the `dumpFormatter` module. This is to fix some inconsistencies in the data and make it easier to
work with:

- All properties are converted to camelCase
- All numeric string values are parsed to integers
- Everywhere where artist or label names appear, they are transformed to multiple properties:
  - The name as it appears in the Discogs dataset is stored as the `originalName` property
  - The `name` property contains the name without any `(n)` numeric postfix
  - The `nameIndex` property is set to the number inside the `(n)` numeric postfix if it exists.
  Otherwise it is set to `1`
- The `duration` field of a `track` is converted to a `number` (the number of seconds). The unformatted
string is stored in the `originalDuration` property
- Images objects are excluded as they do not contain URI. Instead an `imageCount` property is set
which is equal to the number of images.
- Empty string values are excluded
- The `embed` property is removed from `video` (as it was always "true")
- Tracks that don't have a title or a position are excluded
- Identifiers that only have a type but no value are excluded
- Entities that should have a `name` but have no name or an empty string as name are completely excluded.
(there seems to be a small number of them anyway). The CLI outputs warnings when it excludes entities.
- Incorrectly formatted release dates are transformed according to the Discogs Database Guidelines
(either `YYYY` or `YYYY-MM-DD`). Release dates that cannot be transformed are removed.

To see the exact schema of formatted documents, see the JSON schema in the [/schema/docs](./schema/docs)
folder.

## Database import
Currently, this library only contains utilities to import the data dumps into MongoDB. However, the
NodeJS API allows you to use the same code to import into other databases. See the example in
 [Node.JS API](#nodejs-api) below. If you'd like to contribute a script to import into a different
 database, please send a PR :)

### MongoDB Indexes
When using the `mongo` CLI command, some useful indexes will be automatically added to the database
collections to make it faster to query the data. You can see the indexes in the
[mongoIndexSpec.json](./config/mongoIndexSpec.json) file. If you don't want these indexes to be added you
can opt-out using the `--no-indexes` command line flag.

## CLI Usage
 - Use globally installed version: `discogs-data-tools <command> ...args`
 - Using npx: `npx discogs-data-tools <command> ...args`

See the command-specific documentation below. Every command requires you to
specify a target dump version. This can be done with either the `--interactive` (`-i`),
`--latest` (`-l`) or `--target-version` (`-t`) argument.


### fetch command
<!-- CLI: fetch -->
```
discogs-data-tools [command]

Commands:
  discogs-data-tools stream  Stream a data dump from discogs and directly process it into your database

Options:
  --version  Show version number                                                                     [boolean]
  --help     Show help                                                                               [boolean]
```
<!-- /CLI -->

## Node.JS API
```
const { listings, dataManager, fetcher } = require('discogs-data-tools');
```

- *dataManager* Lookup data dump files that have already been downloaded
- *bucket* Lookup available data dumps on the S3 bucket
- *fetcher* Download data dumps and show download progress

See [api.md](./api.md) for available methods per module

### Example: custom processing
```
TODO (coming soon)
```
