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

To see the exact schema of formatted documents, see the JSON schema in the [/schema/doc](./schema/doc)
folder.

## Database import
Currently, this library only contains utilities to import the data dumps into MongoDB. However, the
NodeJS API allows you to use the same code to import into other databases. See examples below.
If you'd like to contribute a script to import into a different database, please send a PR :)

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

<!-- below section is automatically generated. Do not modify -->
<!-- CLI -->

### fetch command
```
discogs-data-tools fetch <target> [...args]

Target (one required):
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --target-version, -t  Manually pass the name of the target dump version. ie: "20180101"             [string]

Optional args:
  --version            Show version number                                                           [boolean]
  --data-dir, -d       Root directory where dumps and related files are stored.   [string] [default: "./data"]
  --collections, -c    Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help               Show help                                                                     [boolean]
  --hide-progress, -n  Don't show a progress bar                                                     [boolean]
  --skip-verify        Skip verifying the dumps with the checksum provided by Discogs                [boolean]

Examples:
  discogs-data-tools fetch --target-version 20180101 --collections labels masters
```

### verify command
```
discogs-data-tools verify <target> [...args]

Target (one required):
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --target-version, -t  Manually pass the name of the target dump version. ie: "20180101"             [string]

Optional args:
  --version          Show version number                                                             [boolean]
  --data-dir, -d     Root directory where dumps and related files are stored.     [string] [default: "./data"]
  --collections, -c  Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help             Show help                                                                       [boolean]

Examples:
  discogs-data-tools verify --latest
  discogs-data-tools verify --target-version 20180101 --collections releases
```

### mongo command
```
discogs-data-tools mongo <target> [...args]

Target (one required):
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --target-version, -t  Manually pass the name of the target dump version. ie: "20180101"             [string]

Optional args:
  --version                   Show version number                                                    [boolean]
  --data-dir, -d              Root directory where dumps and related files are stored.
                                                                                  [string] [default: "./data"]
  --collections, -c           Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help                      Show help                                                              [boolean]
  --chunk-size, -s            Number of rows in processing chunks. Larger size takes more memory.
                                                                                      [number] [default: 1000]
  --drop-existing-collection  Drop a collection if it already exists. Use with caution!              [boolean]
  --silent, -m                Mute all console output                                                [boolean]
  --indexes                   Create indexes on collections                          [boolean] [default: true]
  --skip-validation           Skip validation of XML nodes. Can considerably speed up processing, but you may
                              get invalid rows                                                       [boolean]
  --validate-docs             perform additional validation on the objects after theyhave been formatted. Used
                              for development, not necessary on usage                                [boolean]
  --max-errors, -e            Number of rows that could not be inserted before the command is aborted
                                                                                       [number] [default: 100]
  --bail, -b                  Immediately abort when a validation error occurs or a row failed to persist to
                              the database                                                           [boolean]
  --restart, -r               Don't continue processing from where it last stopped but restart at the first
                              row                                                                    [boolean]
  --database-name, -n         Name of the database to write to                   [string] [default: "discogs"]
  --connection, -o            The MongoDB connection string                                [string] [required]
  --include-image-objects     Include image objects. By default, will only include the image count because
                              image objects in data dumps are missing the URI                        [boolean]

Examples:
  discogs-data-tools mongo --no-indexes --latest --connection mongodb://root:pw@127.0.0.1:27017
  discogs-data-tools mongo --target-version 20180401 --restart --connection mongodb://root:pw@localhost:27017
```

### ls command
```
discogs-data-tools ls <target> [...args]

Target (one required):
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --target-version, -t  Manually pass the name of the target dump version. ie: "20180101"             [string]

Optional args:
  --version          Show version number                                                             [boolean]
  --data-dir, -d     Root directory where dumps and related files are stored.     [string] [default: "./data"]
  --collections, -c  Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help             Show help                                                                       [boolean]
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
