const Ajv = require("ajv");
const objectGet = require("object-get");
const MongoClient = require("mongodb").MongoClient;

const processor = require("../processor");
const indexSpec = require("../config/mongoIndexSpec.json");
const dumpFormatter = require("../processing/dumpFormatter");

const formatters = {
  artists: dumpFormatter.formatArtist,
  labels: dumpFormatter.formatLabel,
  masters: dumpFormatter.formatMaster,
  releases: dumpFormatter.formatRelease
};

const validationSchema = {
  artists: require("../schema/artist-xml.json"),
  labels: require("../schema/label-xml.json"),
  releases: require("../schema/release-xml.json"),
  masters: require("../schema/master-xml.json"),
  defs: require("../schema/defs.json")
};

async function main(argv, client) {
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
    // delete validationSchema.defs.definitions.imagesTag.properties.children.items;
  }
  const validators = {};

  for (const type of argv.types) {
    validators[type] = ajv
      .addSchema(validationSchema.defs)
      .compile(validationSchema[type]);
  }

  async function processEntries(chunk, type) {
    const invalidRows = [];

    const entries = chunk.map((entry, index) => {
      let valid = true;
      if (!argv["no-validate"]) {
        valid = validators[type](entry, { verbose: true });

        if (!valid) {
          const id = (() => {
            if (type === "masters" || type === "releases") {
              return entry.attrs.id;
            }

            const idTag =
              entry.children && entry.children.find(({ tag }) => tag === "id");

            return idTag && idTag.text;
          })();

          invalidRows.push({
            json: JSON.stringify(entry),
            index,
            id,
            reason: "did not match JSON schema"
          });

          if (argv.bail) {
            throw new Error(
              `Invalid row with id ${id}: \n\n${JSON.stringify(entry).substring(
                0,
                40
              )}\n\n${validators[type].errors
                .map(({ dataPath, message, schemaPath }) => {
                  let targetData = "(unable to find target data)";
                  try {
                    targetData = objectGet(
                      entry,
                      dataPath.replace(/^[^.]+\./, "")
                    );
                  } catch (e) {
                    // nothing
                  }
                  return ` >>> ${message}:\n${JSON.stringify(
                    targetData, null, '  '
                  )}\n${schemaPath}\n`;
                })
                .join("\n")}\n`
            );
          }
        }
      }

      return { entry, originalIndex: index, valid };
    });

    const documents = entries
      .filter(doc => doc.valid)
      .map(entry => ({
        ...entry,
        doc: formatters[type](entry.entry, argv["include-image-objects"])
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
  // Create a new MongoClient
  const client = new MongoClient(argv.connection);

  main(argv, client).catch(e => {
    console.error(`\n${e.stack}\n`);

    return client.close();
  });
};
