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

  const encountered = new Set();
  for (const child of label.children) {
    if (encountered.has(child.tag)) {
      throw new Error(`Unexpected duplicate ${child.tag}`)
    }
    encountered.add(child.tag);

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
  }

  return res;
}

/**
 * Format an artist tag. See readme.md for information of how the data is
 * transformed
 * @param artist {Object} An artist tag parsed by XMLParser which conforms
 * to the schema/artist-xml.json schema
 * @param [includeImageObjects=false] {boolean} If true, include the images
 * object (even though they do not contain URI)
 * @returns {object}
 */
function formatArtist(artist, includeImageObjects = false) {
  const res = {
    imageCount: 0,
    urls: [],
    aliases: [],
    members: [],
    nameVariations: []
  };

  const encountered = new Set();
  for (const child of artist.children) {
    if (encountered.has(child.tag)) {
      throw new Error(`Unexpected duplicate ${child.tag}`)
    }
    encountered.add(child.tag);

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
        for (const { tag, text, attrs } of child.children) {
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
        }
        break;
      case "data_quality":
        res.dataQuality = child.text || "";
        break;
      default:
        throw new Error(`Unexpected child tag "${child.tag}"`);
    }
  }

  return res;
}

/**
 * Format a master tag. See readme.md for information of how the data is
 * transformed
 * @param master {Object} A master tag parsed by XMLParser which conforms
 * to the schema/master-xml.json schema
 * @param [includeImageObjects=false] {boolean} If true, include the images
 * object (even though they do not contain URI)
 * @returns {object}
 */
function formatMaster(master, includeImageObjects = false) {
  const res = {
    id: parseIntSafe(master.attrs.id),
    imageCount: 0,
    artists: [],
    styles: [],
    genres: [],
    videos: [],
  };

  const encountered = new Set();
  for (const child of master.children) {
    if (encountered.has(child.tag)) {
      throw new Error(`Unexpected duplicate ${child.tag}`)
    }
    encountered.add(child.tag);

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
      case "artists":
        res.artists = child.children.map(({ children }) => {
          const resArtist = {};

          const enc2 = new Set();
          for (const artistChildTag of children) {
            if (enc2.has(artistChildTag.tag)) {
              throw new Error(`Unexpected duplicate ${artistChildTag.tag} in artist`)
            }
            enc2.add(artistChildTag.tag);
            switch(artistChildTag.tag) {
              case 'id':
                resArtist.id = parseIntSafe(artistChildTag.text);
                break;
              case 'name':
                parseDiscogsName(artistChildTag.text, resArtist);
                break;
              case 'anv':
                resArtist.anv = parseDiscogsName(artistChildTag.text, {});
                // resArtist.anv = child.children
                //   .filter(({ text }) => !!text)
                //   .map(({ text }) => parseDiscogsName(text, {}));
                break;
              case 'join':
                if (artistChildTag.text) {
                  resArtist.join = artistChildTag.text;
                }
                break;
              case 'role':

                break;
              case 'tracks':

                break;
              default:
                throw new Error(`Unexpected artist child tag "${artistChildTag.tag}"`);
            }
          }

          return resArtist;
        });
        break;
      case "videos":
        res.videos = child.children.map(({ children, attrs }) => {
          const resVideo = {
            duration: parseIntSafe(attrs.duration),
            embed: attrs.embed === 'true',
            src: attrs.src
          };

          const enc2 = new Set();
          for (const videoChildTag of children) {
            if (enc2.has(videoChildTag.tag)) {
              throw new Error(`Unexpected duplicate ${videoChildTag.tag} in video`)
            }
            enc2.add(videoChildTag.tag);
            switch(videoChildTag.tag) {
              case 'title':
              case 'description':
                if (videoChildTag.text) {
                  resVideo[videoChildTag.tag] = videoChildTag.text;
                }
                break;
              default:
                throw new Error(`Unexpected artist child tag "${videoChildTag.tag}"`);
            }
          }

          return resVideo;
        });
        break;
      case "main_release":
        res.mainRelease = parseIntSafe(child.text);
        break;
      case "year":
        res.year = parseIntSafe(child.text);
        break;
      case "data_quality":
      case "notes":
        if (child.text) {
          res[child.tag] = child.text;
        }
        break;
      case "title":
        if (child.text.match(/\(\d+\)$/)) {
          throw new Error(`Unexpected title: ${child.text}`);
        }
        res[child.tag] = child.text;
        break;
      case "genres":
      case "styles":
        for (const { text } of child.children) {
          res[child.tag].push(text);
        }
        break;
      default:
        throw new Error(`Unexpected child tag "${child.tag}"`);
    }
  }

  return res;
}

/**
 * Format a release tag. See readme.md for information of how the data is
 * transformed
 * @param release {Object} A release tag parsed by XMLParser which conforms
 * to the schema/master-xml.json schema
 * @param [includeImageObjects=false] {boolean} If true, include the images
 * object (even though they do not contain URI)
 * @returns {object}
 */
function formatRelease(release, includeImageObjects = false) {
  const res = {
  };

  release.children.forEach(child => {
    switch (child.tag) {
      default:
        throw new Error(`Unexpected child tag "${child.tag}"`);
    }
  });

  return res;
}

module.exports = { formatLabel, formatArtist, formatMaster, formatRelease };
