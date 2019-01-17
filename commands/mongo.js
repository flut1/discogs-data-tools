const Ajv = require("ajv");
const MongoClient = require("mongodb").MongoClient;
const labelSchema = require("../schema/label-xml.json");

const processor = require("../processor");
const artistSchema = require("../schema/artist-xml.json");
const indexSpec = require("../config/mongoIndexSpec.json");
const { formatLabel, formatArtist } = require('../processing/dumpFormatter');

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
        doc: formatLabel(entry.entry)
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

      const documents = chunk.map(formatArtist).filter(_ => _);

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
