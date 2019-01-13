const fs = require("fs-extra");
const path = require("path");

const DATA_DIR = "./data";
const DATA_TYPES = ["artists", "labels", "masters", "releases"];

/**
 * Get the path where a data XML is saved
 * @param version {string} The exact version name, eg '20180101'
 * @param type {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [gz=false] {boolean} If this is the compressed file (.xml.gz) or
 * non-compressed (.gz)
 * @returns {string}
 */
function getXMLPath(version, type, gz = false) {
  return path.join(
    __dirname,
    DATA_DIR,
    version,
    `discogs_${version}_${type}.xml${gz ? ".gz" : ""}`
  );
}

/**
 * Looks up an existing data xml on disk
 * @param version {string} The exact version name, eg '20180101'
 * @param type {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @param [gz=false] {boolean} If this is the compressed file (.xml.gz) or
 * non-compressed (.gz)
 * @returns {Object|null} An object of the form `{ path: string, gz: boolean }`
 * if the file was found, null otherwise
 */
function findXML(version, type, gz = false) {
  const targetPath = getXMLPath(version, type, gz);
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
 * @returns {Array<Object|null>} An array of results for each type:
 * An object of the form `{ path: string, gz: boolean }` if the file was found,
 * null otherwise
 */
function findData(version, types = DATA_TYPES) {
  return types.map(
    type => findXML(version, type, true) || findXML(version, type)
  );
}

module.exports = {
  findXML,
  getXMLPath,
  findData,
  DATA_TYPES
};
