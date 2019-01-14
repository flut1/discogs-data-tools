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

<!-- below section is automatically generated. Do not modify -->
```
discogs-data-tools <command> [...args]
For help on a command run "discogs-data-tools <command> help"

Commands:
  discogs-data-tools fetch  fetch data dump from discogs

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Node.JS API
```
const { listings, localDumps, fetcher } = require('discogs-data-tools');
```

- *localDumps* Lookup data dump files that have already been downloaded
- *remoteDumps* Lookup available data dumps on the S3 bucket
- *fetcher* Download data dumps and show download progress

See [api.md](./api.md) for available methods per module
