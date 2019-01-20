const fs = require("fs-extra");
const path = require("path");
const globCallback = require('glob');
const { promisify } = require("es6-promisify");
const { COLLECTIONS, DEFAULT_DATA_DIR } = require('./constants');

const glob = promisify(globCallback);

/**
 * Lookup data dump files that have already been downloaded
 * @module localDumps
 */

/**
 * Get the path where a data XML is saved
 * @param version {string} The exact version name, eg '20180101'
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [gz=false] {boolean} If this is the compressed file (.xml.gz) or
 * non-compressed (.gz)
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {string}
 */
function getXMLPath(version, collection, gz = false, dataDir = DEFAULT_DATA_DIR) {
  return path.resolve(
    dataDir,
    version,
    `discogs_${version}_${collection}.xml${gz ? ".gz" : ""}`
  );
}

/**
 * Get the path to where the checksum file for a specified version is stored
 * @param version {string} The exact version name, eg '20180101'
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {string}
 */
function getChecksumPath(version, dataDir = DEFAULT_DATA_DIR) {
  return path.resolve(
    dataDir,
    version,
    `discogs_${version}_CHECKSUM.txt`
  );
}

/**
 * Looks up an existing data xml on disk
 * @param version {string} The exact version name, eg '20180101'
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [gz=false] {boolean} If this is the compressed file (.xml.gz) or
 * non-compressed (.gz)
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {Object|null} An object of the form `{ path: string, gz: boolean }`
 * if the file was found, null otherwise
 */
function findXML(version, collection, gz = false, dataDir = DEFAULT_DATA_DIR) {
  const targetPath = getXMLPath(version, collection, gz, dataDir);
  if (fs.existsSync(targetPath)) {
    return { path: targetPath, gz };
  }
  return null;
}

/**
 * Looks up the xml files on disk for a given version
 * @param version {string} The exact version name, eg '20180101'
 * @param collections {string[]} An array of types to get. Possible options:
 * "artists", "labels", "masters" or "releases".  Defaults to all types
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {Array<Object|null>} An array of results for each type:
 * An object of the form `{ path: string, gz: boolean }` if the file was found,
 * null otherwise
 */
function findData(version, collections = COLLECTIONS, dataDir = DEFAULT_DATA_DIR) {
  return collections.map(
    collection =>
      findXML(version, collection, true, dataDir) ||
      findXML(version, collection, false, dataDir)
  );
}

/**
 * List all data downloaded to the data directory
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {Object} A map containing all downloaded files
 */
function globDumps(dataDir = DEFAULT_DATA_DIR) {
  return glob('*/discogs_*.@(xml|txt)?(.gz)', { cwd: path.resolve( dataDir) })
    .then(files => files.reduce((result, file) => {
      const match = file.match(/discogs_([^_]+)_([^.]+)\.(xml|txt)/);
      if (match) {
        if (!result[match[1]]) {
          result[match[1]] = {};
        }
        result[match[1]][match[2]] = file;
      }

      return result;
    }, {}));
}

module.exports = {
  findXML,
  globDumps,
  getXMLPath,
  getChecksumPath,
  findData,
  COLLECTIONS
};
