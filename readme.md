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

fetch data dump from discogs

Options:
  --version             Show version number                                                          [boolean]
  --data-dir, --dd      Root directory where dumps and related files are stored.  [string] [default: "./data"]
  --help                Show help                                                                    [boolean]
  --year, -y            The year to find monthly dumps for.                                           [number]
  --no-progress, --np   Hides the progress bar                                                       [boolean]
  --dump-version, --dv  Full name of the version to fetch. ie: 20180101. If not specified, will let you select
                        interactively                                                                 [string]
  --latest, -l          Automatically get the latest version                                         [boolean]
  --types, -t           List of types to get
                                       [array] [choices: "artists", "labels", "masters", "releases"] [default:
                                                                    ["artists","labels","masters","releases"]]

Examples:
  discogs-data-tools fetch --dumpVersion 20180101 --types labels masters
```

### mongo command
```
discogs-data-tools mongo

import data dump into mongo database

Options:
  --version                    Show version number                                                   [boolean]
  --data-dir, --dd             Root directory where dumps and related files are stored.
                                                                                  [string] [default: "./data"]
  --help                       Show help                                                             [boolean]
  --dump-version, --dv         Full name of the version to fetch. ie: 20180101                        [string]
  --chunk-size, --cs           Size of processing chunks. Larger size takes more memory
                                                                                      [number] [default: 1000]
  --no-index, --ni             Don't create indexes on collections                                   [boolean]
  --no-validate, --nv          Skip validation of XML nodes. Can considerably speed up processing, but you may
                               get invalid rows                                                      [boolean]
  --restart, -r                Don't continue processing from where it last stopped but restart at the first
                               row                                                                   [boolean]
  --include-image-objects, -i  Include image objects. By default, will only include the image count because
                               image objects in data dumps are missing the URI                       [boolean]
  --types, -t                  List of types to get
                                       [array] [choices: "artists", "labels", "masters", "releases"] [default:
                                                                    ["artists","labels","masters","releases"]]
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
