# Discogs Data Tools
Some utilities to download and process Discogs monthly data dumps. Currently only manages downloading
the data dumps. More functionality (like processing) to come

**This module is not officially affiliated with Discogs.** For license information on Discogs
data dumps see: https://data.discogs.com/

## Installation

- Install Node.JS (min 8.2.1)
- Some dependencies are built using `node-gyp`, which has additional prerequisites. See the [node-gyp documentation](https://github.com/nodejs/node-gyp#Installation) for more info.
- Run `npm install -g discogs-data-tools`

## CLI Usage
```
discogs-data-tools <command>
```

<!-- below section is automatically generated. Do not modify -->
<!-- CLI -->

### fetch command
```
discogs-data-tools fetch

Fetch data dump from discogs

Options:
  --version             Show version number                                                          [boolean]
  --data-dir, -d        Root directory where dumps and related files are stored.  [string] [default: "./data"]
  --target-version, -t  Full name of the target dump version. ie: 20180101                            [string]
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --collections, -c     Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help                Show help                                                                    [boolean]
  --hide-progress, -n   Don't show a progress bar                                                    [boolean]
  --skip-verify         Skip verifying the dumps with the checksum provided by Discogs               [boolean]

Examples:
  discogs-data-tools fetch --target-version 20180101 --collections labels masters
```

### verify command
```
discogs-data-tools verify

Verify dump files that have previously been downloaded. Note: by default, the fetch command already verifies

Options:
  --version             Show version number                                                          [boolean]
  --data-dir, -d        Root directory where dumps and related files are stored.  [string] [default: "./data"]
  --target-version, -t  Full name of the target dump version. ie: 20180101                            [string]
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --collections, -c     Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help                Show help                                                                    [boolean]

Examples:
  discogs-data-tools verify --latest
  discogs-data-tools verify --target-version 20180101 --collections releases
```

### mongo command
```
discogs-data-tools mongo

import data dump into mongo database

Options:
  --version                   Show version number                                                    [boolean]
  --data-dir, -d              Root directory where dumps and related files are stored.
                                                                                  [string] [default: "./data"]
  --target-version, -t        Full name of the target dump version. ie: 20180101                      [string]
  --interactive, -i           Interactively select the target dump version                           [boolean]
  --latest, -l                Automatically select the latest version                                [boolean]
  --collections, -c           Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help                      Show help                                                              [boolean]
  --chunk-size, -s            Number of rows in processing chunks. Larger size takes more memory.
                                                                                      [number] [default: 1000]
  --drop-existing-collection  Drop a collection if it already exists. Use with caution!              [boolean]
  --silent, -m                Mute all console output                                                [boolean]
  --indexes                   Create indexes on collections                          [boolean] [default: true]
  --skip-validation           Skip validation of XML nodes. Can considerably speed up processing, but you may
                              get invalid rows                                       [boolean] [default: true]
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
  discogs-data-tools mongo --target-version 20180401 --chunk-size 100 --connection mongodb://root:pw@127.0.0.1:27017
```

### ls command
```
discogs-data-tools ls

List all downloaded data

Options:
  --version             Show version number                                                          [boolean]
  --data-dir, -d        Root directory where dumps and related files are stored.  [string] [default: "./data"]
  --target-version, -t  Full name of the target dump version. ie: 20180101                            [string]
  --interactive, -i     Interactively select the target dump version                                 [boolean]
  --latest, -l          Automatically select the latest version                                      [boolean]
  --collections, -c     Select which collections to target. If not given, will target all
                                                 [array] [choices: "artists", "labels", "masters", "releases"]
  --help                Show help                                                                    [boolean]
```
<!-- /CLI -->

## Node.JS API
```
const { listings, localDumps, fetcher } = require('discogs-data-tools');
```

- *localDumps* Lookup data dump files that have already been downloaded
- *remoteDumps* Lookup available data dumps on the S3 bucket
- *fetcher* Download data dumps and show download progress

See [api.md](./api.md) for available methods per module
