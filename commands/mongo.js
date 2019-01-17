const processor = require("../processor");
const fs = require("fs-extra");
const Ajv = require("ajv");
const MongoClient = require("mongodb").MongoClient;
const labelSchema = require("../schema/label-xml.json");
const artistSchema = require("../schema/artist-xml.json");
const indexSpec = require("../config/mongoIndexSpec.json");
const { parseIntSafe, parseDiscogsName } = require("../util/parseUtils");

async function main(argv) {
  // Create a new MongoClient
  const client = new MongoClient(argv.connection);

  const ajv = new Ajv({ verbose: true });
  if (!argv["include-image-objects"]) {
    // no need to verify the item content
    delete labelSchema.properties.children.items.oneOf[0].properties.children
      .items;
  }
  const validateLabel = ajv.compile(labelSchema);
  const validateArtist = ajv.compile(artistSchema);

  // Use connect method to connect to the Server
  try {
    await client.connect();
  } catch (e) {
    throw new Error(`Could not connect to MongoDB: ${e}`);
  }
  console.log("Connected successfully to server");
  const db = client.db(argv["database-name"]);

  function labelXMLToDocument(label) {
    const res = {
      imageCount: 0,
      urls: [],
      subLabels: []
    };
    label.children.forEach(child => {
      switch (child.tag) {
        case "images":
          if (argv["include-image-objects"]) {
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

  function artistXMLToDocument(artist) {
    const res = {
      urls: [],
      aliases: [],
      members: [],
      nameVariations: []
    };

    artist.children.forEach(child => {
      switch (child.tag) {
        case "images":
          if (argv["include-image-objects"]) {
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

  const processors = {
    labels: async function processLabels(chunk) {
      const invalidRows = [];

      const entries = chunk
        .map((entry, index) => {
          let valid = true;
          if (!argv["no-validate"]) {
            valid = validateLabel(entry);

            if (!valid) {
              invalidRows.push({
                json: JSON.stringify(entry),
                index,
                id: entry.id,
                reason: 'did not match JSON schema'
              });
            }
          }

          return { entry, originalIndex: index, valid };
        });

      const documents = entries.filter(doc => doc.valid).map(entry => ({
        ...entry,
        doc: labelXMLToDocument(entry.entry)
      }));

      try {
        await db.collection("labels").bulkWrite(
          documents.map(({ doc }) => ({
            updateOne: {
              filter: { id: doc.id },
              upsert: true,
              update: doc
            }
          }))
        );
      } catch (e) {
        const { entry, originalIndex, doc } = documents[e.index];
        let reason = 'could not be written to MongoDB';

        if (e.code === 11000){
          reason = 'had a key that already existed in the database'
        }

        invalidRows.push({
          json: JSON.stringify(entry),
          index: originalIndex,
          id: doc.id,
          reason
        });
      }

      return invalidRows;
    },
    artists: async function processArtists(chunk) {
      for (const entry of chunk) {
        if (!argv["no-validate"]) {
          const valid = validateArtist(entry);

          if (!valid) {
            const lastError =
              validateArtist.errors[validateArtist.errors.length - 1];
            console.log(validateArtist.errors);
            console.log(JSON.stringify(lastError.data, null, "  "));
            console.log(JSON.stringify(entry, null, "  "));
            throw new Error();
          }
        }
      }

      const documents = chunk.map(artistXMLToDocument).filter(_ => _);

      await db.collection("artists").bulkWrite(
        documents.map(doc => ({
          updateOne: {
            filter: { id: doc.id },
            upsert: true,
            update: doc
          }
        }))
      );
    },
    masters: async function processMasters(chunk) {
      throw new Error();
    },
    releases: async function processReleases(chunk) {
      throw new Error();
    }
  };

  function processEntries(chunk, type) {
    return processors[type](chunk);
  }

  if (!argv["no-index"]) {
    for (const type of argv.types) {
      console.log(`Ensuring indexes on ${type} collection...`);

      await db.collection(type).createIndexes(indexSpec[type]);
    }
  }

  await processor.processDumps(
    argv["dump-version"],
    argv.types,
    processEntries,
    argv["chunk-size"],
    argv.restart,
    argv["data-dir"],
    argv['max-errors']
  );
  client.close();
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
