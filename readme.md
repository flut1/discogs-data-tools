# Discogs Data Tools
Some utilities to download and process Discogs monthly data dumps.

- Download data dumps from Discogs
- Verify data dumps with checksum
- Validate and normalize XML data in data dumps to plain objects
- Store entities in MongoDB collections

You can use the NodeJS API if you want to decide what to do with the
formatted JS objects yourself, instead of writing it to a MongoDB database.
See [Node.JS API](#nodejs-api) below for an example.

**This module is not officially affiliated with Discogs.** For license information on Discogs
data dumps see: https://data.discogs.com/

## Installation

- Install Node.JS (min 8.2.1)
- Some dependencies are built using `node-gyp`, which has additional prerequisites. See the [node-gyp documentation](https://github.com/nodejs/node-gyp#Installation) for more info.
- Run `npm install -g discogs-data-tools`

## CLI Usage
```
discogs-data-tools <command> args
```
See the command-specific documentation below. Every command requires you to
specify a target dump version. This can be done with either the `--interactive` (`-i`),
`--latest` (`-l`) or `--target-version` (`-t`) argument.

<!-- below section is automatically generated. Do not modify -->
<!-- CLI -->

### fetch command
```

```

### verify command
```

```

### mongo command
```

```

### ls command
```

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

