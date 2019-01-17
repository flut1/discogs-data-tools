const Ajv = require("ajv");
const MongoClient = require("mongodb").MongoClient;

const processor = require("../processor");
const indexSpec = require("../config/mongoIndexSpec.json");
const dumpFormatter = require("../processing/dumpFormatter");

const formatters = {
  artists: dumpFormatter.formatArtist,
  labels: dumpFormatter.formatLabel
};

const validationSchema = {
  artists: require("../schema/artist-xml.json"),
  labels: require("../schema/label-xml.json")
};

async function main(argv) {
  // Create a new MongoClient
  const client = new MongoClient(argv.connection);

  // Use connect method to connect to the Server
  try {
    await client.connect();
  } catch (e) {
    throw new Error(`Could not connect to MongoDB: ${e}`);
  }
  console.log("Connected successfully to server");
  const db = client.db(argv["database-name"]);

  if (!argv["no-index"]) {
    for (const type of argv.types) {
      console.log(`Ensuring indexes on ${type} collection...`);

      await db.collection(type).createIndexes(indexSpec[type]);
    }
  }

  const ajv = new Ajv({ verbose: true });
  if (!argv["include-image-objects"]) {
    // no need to verify the item content
    delete validationSchema.artists.properties.children.items.oneOf[0]
      .properties.children.items;
    delete validationSchema.labels.properties.children.items.oneOf[0].properties
      .children.items;
  }
  const validators = {};

  for (const type of argv.types) {
    validators[type] = ajv.compile(validationSchema[type]);
  }

  async function processEntries(chunk, type) {
    const invalidRows = [];

    const entries = chunk.map((entry, index) => {
      let valid = true;
      if (!argv["no-validate"]) {
        valid = validators[type](entry);

        if (!valid) {
          invalidRows.push({
            json: JSON.stringify(entry),
            index,
            id: entry.id,
            reason: "did not match JSON schema"
          });
        }
      }

      return { entry, originalIndex: index, valid };
    });

    const documents = entries
      .filter(doc => doc.valid)
      .map(entry => ({
        ...entry,
        doc: formatters[type](entry.entry)
      }));

    try {
      await db.collection(type).bulkWrite(
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
      let reason = "could not be written to MongoDB";

      if (e.code === 11000) {
        reason = "had a key that already existed in the database";
      }

      invalidRows.push({
        json: JSON.stringify(entry),
        index: originalIndex,
        id: doc.id,
        reason
      });
    }

    return invalidRows;
  }

  await processor.processDumps(
    argv["dump-version"],
    argv.types,
    processEntries,
    argv["chunk-size"],
    argv.restart,
    argv["data-dir"],
    argv["max-errors"]
  );

  await client.close();
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
