const logger = require('./logger');

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
  // eslint-disable-next-line no-restricted-globals
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
    return target;
  }
  /* eslint-disable no-param-reassign */

  target.originalName = name;

  if (name.endsWith(")")) {
    const nameIndexMatch = name.match(/^([\s\S]+?)(?:\s?\((\d{1,3})\))?$/);

    if (!nameIndexMatch) {
      throw new Error(`Expected name to match regex pattern: ${name}`);
    }

    target.nameIndex = nameIndexMatch[2] ? parseInt(nameIndexMatch[2], 10) : 1;
    // eslint-disable-next-line prefer-destructuring
    target.name = nameIndexMatch[1];
  } else {
    target.nameIndex = 1;
    target.name = name;
  }
  /* eslint:enable no-param-reassign */

  return target;
}

/**
 * Parses the duration string from a Discogs XML file and stores the result
 * on the target object. Will store the string as-is on the 'originalDuration'
 * property. If the duration is formatted somewhat correctly, will calculate the
 * duration in number of seconds and store it on the 'duration' property.
 * @param duration {string} A duration formatted as string
 * @param target {object} The target object to store results on
 * @returns {object} `target` for chaining
 */
function parseDuration(duration, target) {
  if (duration) {
    target.originalDuration = duration;

    const parts = duration.split(/[:.]/g);
    if (parts.some(part => !part.match(/^\d+$/))) {
      logger.warn(`Could not parse duration "${duration}"`);
      logger.log(JSON.stringify(target));
      return target;
    }

    const hours = parts.length > 2 ? parseIntSafe(parts[parts.length - 2]) : 0;
    const minutes = parts.length > 1 ? parseIntSafe(parts[parts.length - 2]) : 0;
    const seconds = parseIntSafe(parts[parts.length - 1]);

    target.duration = seconds + minutes * 60 + hours * 60 * 60;
  }
  return target;
}

/**
 * Will parse the given release date and format it according to Discogs
 * Database Guidelines. The result is stored on the "released" property of the
 * target object. The date will be either formatted as YYYY or YYYY-MM-DD.
 * If only the year and month are given, the date will be set to 00. If dashes
 * are missing, they will be added. All other formats are discarded.
 * @param date {string} The date string to parse
 * @param {object} `target` for chaining
 */
function parseReleaseDate(date, target) {
  if (date.length === 4 && date.match(/^[\d]{4}$/)) {
    target.released = date;
  } else if (date.match(/^[\d]{4}-[\d]{2}-[\d]{2}$/)) {
    target.released = date;
  } else if (date.match(/^[\d]{4}-[\d]{2}$/)) {
    target.released = `${date}-00`;
  } else if (date.match(/^[\d]{8}$/)) {
    target.released = `${date.substring(0, 4) -
      date.substring(4, 6) -
      date.substring(6)}`;
  } else {
    logger.warn(`dropping invalid release date "${date}"`);
  }
  return target;
}

module.exports = {
  parseIntSafe,
  parseDiscogsName,
  parseDuration,
  parseReleaseDate
};
