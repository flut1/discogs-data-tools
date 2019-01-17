const fs = require("fs-extra");
const path = require("path");

const DEFAULT_DATA_DIR = "./data";
const DATA_TYPES = ["artists", "labels", "masters", "releases"];

/**
 * Lookup data dump files that have already been downloaded
 * @module localDumps
 */

/**
 * Get the path where a data XML is saved
 * @param version {string} The exact version name, eg '20180101'
 * @param type {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [gz=false] {boolean} If this is the compressed file (.xml.gz) or
 * non-compressed (.gz)
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {string}
 */
function getXMLPath(version, type, gz = false, dataDir = DEFAULT_DATA_DIR) {
  return path.resolve(
    dataDir,
    version,
    `discogs_${version}_${type}.xml${gz ? ".gz" : ""}`
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
 * @param type {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [gz=false] {boolean} If this is the compressed file (.xml.gz) or
 * non-compressed (.gz)
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {Object|null} An object of the form `{ path: string, gz: boolean }`
 * if the file was found, null otherwise
 */
function findXML(version, type, gz = false, dataDir = DEFAULT_DATA_DIR) {
  const targetPath = getXMLPath(version, type, gz, dataDir);
  if (fs.existsSync(targetPath)) {
    return { path: targetPath, gz };
  }
  return null;
}

/**
 * Looks up the xml files on disk for a given version
 * @param version {string} The exact version name, eg '20180101'
 * @param types {string[]} An array of types to get. Possible options:
 * "artists", "labels", "masters" or "releases".  Defaults to all types
 * @param [dataDir="./data"] {string} Root directory where `discogs-data-tools`
 * stores data files. Defaults to ./data relative to working directory
 * @returns {Array<Object|null>} An array of results for each type:
 * An object of the form `{ path: string, gz: boolean }` if the file was found,
 * null otherwise
 */
function findData(version, types = DATA_TYPES, dataDir = DEFAULT_DATA_DIR) {
  return types.map(
    type =>
      findXML(version, type, true, dataDir) ||
      findXML(version, type, false, dataDir)
  );
}

module.exports = {
  findXML,
  getXMLPath,
  getChecksumPath,
  findData,
  DATA_TYPES
};
