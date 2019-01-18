/**
 * Small helpers for parsing discogs data
 * @module util/parseUtils
 */

/**
 * Runs parseInt and errors when the result is NaN
 * @param str {string} The string to parse
 * @returns {number}
 */
function parseIntSafe(str) {
  const res = parseInt(str, 10);
  if (isNaN(res)) {
    throw new Error(`Could not convert "${str}" to integer`);
  }
  return res;
}

/**
 * Parses a name from Discogs that potentially has a "(n)" numeric postfix.
 * Stores the result on the specified target object. Will set the following
 * properties:
 *
 * name: the name with the "(n)" postfix removed \
 * originalName: the name without modifications \
 * nameIndex: the number n inside the postfix. 1 if there isn't any
 *
 * @param name {string} The name to parse
 * @param target {object} An object to store the results on
 * @returns {object} A reference to target
 */
function parseDiscogsName(name, target) {
  if (!name) {
    return;
  }

  target.originalName = name;

  if (name.endsWith(")")) {
    const nameIndexMatch = name.match(/^([\s\S]+?)(?:\s?\((\d{1,3})\))?$/);

    if (!nameIndexMatch) {
      throw new Error(`Expected name to match regex pattern: ${name}`);
    }

    target.nameIndex = nameIndexMatch[2] ? parseInt(nameIndexMatch[2]) : 1;
    target.name = nameIndexMatch[1];
  } else {
    target.nameIndex = 1;
    target.name = name;
  }

  return target;
}

module.exports = { parseIntSafe, parseDiscogsName };
