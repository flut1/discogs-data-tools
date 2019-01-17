const { parseIntSafe, parseDiscogsName } = require("../util/parseUtils");

/**
 * Helpers to transform on the dumps parsed by XMLParser into plain objects
 * that are easier to work with.
 *
 * @module processing/dumpFormatter
 */

/**
 * Format a label tag. See readme.md for information of how the data is
 * transformed
 * @param label {Object} A label as tag parsed by XMLParser which conforms
 * to the schema/label-xml.json schema
 * @param [includeImageObjects=false] {boolean} If true, include the images
 * object (even though they do not contain URI)
 * @returns {object}
 */
function formatLabel(label, includeImageObjects = false) {
  const res = {
    imageCount: 0,
    urls: [],
    subLabels: []
  };
  label.children.forEach(child => {
    switch (child.tag) {
      case "images":
        if (includeImageObjects) {
          res.images = child.children.map(
            ({ attrs: { width, height, type, uri, uri150 } }) => ({
              width: width ? parseIntSafe(width) : 0,
              height: height ? parseIntSafe(height) : 0,
              type,
              uri,
              uri150
            })
          );
        }

        res.imageCount = child.children.length;
        break;
      case "id":
        res.id = parseIntSafe(child.text);
        break;
      case "urls":
        res.urls = child.children.map(({ text }) => text).filter(_ => _);
        break;
      case "sublabels":
        res.subLabels = child.children.map(({ text, attrs }) => {
          const sublabel = { id: parseIntSafe(attrs.id) };
          parseDiscogsName(text, sublabel);
          return sublabel;
        });
        break;
      case "parentLabel":
        res.parent = {
          id: parseIntSafe(child.attrs.id)
        };

        parseDiscogsName(child.text, res.parent);
        break;
      case "name":
        parseDiscogsName(child.text, res);
        break;
      case "profile":
      case "contactinfo":
        res[child.tag] = child.text || "";
        break;
      case "data_quality":
        res.dataQuality = child.text || "";
        break;
      default:
        throw new Error(`Unexpected child tag "${child.tag}"`);
    }
  });

  return res;
}

/**
 * Format an artist tag. See readme.md for information of how the data is
 * transformed
 * @param label {Object} An artist tag parsed by XMLParser which conforms
 * to the schema/artist-xml.json schema
 * @param [includeImageObjects=false] {boolean} If true, include the images
 * object (even though they do not contain URI)
 * @returns {object}
 */
function formatArtist(artist, includeImageObjects = false) {
  const res = {
    urls: [],
    aliases: [],
    members: [],
    nameVariations: []
  };

  artist.children.forEach(child => {
    switch (child.tag) {
      case "images":
        if (includeImageObjects) {
          res.images = child.children.map(
            ({ attrs: { width, height, type, uri, uri150 } }) => ({
              width: width ? parseIntSafe(width) : 0,
              height: height ? parseIntSafe(height) : 0,
              type,
              uri,
              uri150
            })
          );
        }

        res.imageCount = child.children.length;
        break;
      case "aliases":
      case "groups":
        res[child.tag] = child.children.map(({ text, attrs }) => {
          const childRes = {
            id: parseIntSafe(attrs.id)
          };

          if (text) {
            parseDiscogsName(text, childRes);
          }
          return childRes;
        });
        break;
      case "id":
        res.id = parseIntSafe(child.text);
        break;
      case "urls":
        res.urls = child.children.map(({ text }) => text).filter(_ => _);
        break;
      case "namevariations":
        res.nameVariations = child.children
          .filter(({ text }) => !!text)
          .map(({ text }) => parseDiscogsName(text, {}));

        break;
      case "realname":
        if (child.text) {
          res.realName = parseDiscogsName(child.text, {});
        }
        break;
      case "name":
        if (!child.text) {
          console.log("Skipping artist with empty name");
          return null;
        }
        parseDiscogsName(child.text, res);
        break;
      case "profile":
        res[child.tag] = child.text || "";
        break;
      case "members":
        child.children.forEach(({ tag, text, attrs }) => {
          switch (tag) {
            case "name": {
              const idParsed = parseIntSafe(attrs.id);
              const currentIndex = res.members.findIndex(
                ({ id }) => idParsed === id
              );
              if (currentIndex >= 0) {
                parseDiscogsName(text, res.members[currentIndex]);
              } else {
                const newMember = { id: idParsed };
                parseDiscogsName(text, newMember);
                res.members.push(newMember);
              }

              break;
            }
            case "id": {
              const idParsed = parseIntSafe(text);
              if (!res.members.some(({ id }) => idParsed === id)) {
                res.members.push({ id: idParsed });
              }
              break;
            }
            default:
              throw new Error(`Unexpected tag name members.${tag}`);
          }
        });
        break;
      case "data_quality":
        res.dataQuality = child.text || "";
        break;
      default:
        throw new Error(`Unexpected child tag "${child.tag}"`);
    }
  });

  return res;
}

module.exports = { formatLabel, formatArtist };
