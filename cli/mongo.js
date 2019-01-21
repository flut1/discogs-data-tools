const Ajv = require("ajv");
const objectGet = require("object-get");
const { MongoClient } = require("mongodb");
const fs = require("fs-extra");
const logger = require("../util/logger");

const processor = require("../processing/processor");
const indexSpec = require("../config/mongoIndexSpec.json");
const dumpFormatter = require("../processing/dumpFormatter");
const getVersionFromArgv = require("./getVersionFromArgv");

const { COLLECTIONS } = require("../constants");

const formatters = {
  artists: dumpFormatter.formatArtist,
  labels: dumpFormatter.formatLabel,
  masters: dumpFormatter.formatMaster,
  releases: dumpFormatter.formatRelease
};

const validationSchema = {
  xml: {
    artists: require("../schema/artist-xml.json"),
    labels: require("../schema/label-xml.json"),
    releases: require("../schema/release-xml.json"),
    masters: require("../schema/master-xml.json"),
    defs: require("../schema/defs.json")
  },
  doc: {
    artists: require("../schema/artist-doc.json"),
    labels: require("../schema/label-doc.json"),
    releases: require("../schema/release-doc.json"),
    masters: require("../schema/master-doc.json")
  }
};

const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout));

async function main(argv, client) {
  let numInvalid = 0;

  if (argv.silent) {
    logger.mute();
  }
  if (!argv.interactive) {
    logger.startSpinner();
  }
  const version = await getVersionFromArgv(argv);
  if (argv.interactive) {
    logger.startSpinner();
  }

  logger.status("Connecting to MongoBD...");
  // Use connect method to connect to the Server
  try {
    await client.connect();
  } catch (e) {
    logger.error("Could not connect to MongoDB");
    throw new Error(e);
  }
  logger.succeed("Connected to MongoDB server");

  const db = client.db(argv["database-name"]);
  const collections = argv.collections || COLLECTIONS;

  if (argv["drop-existing-collection"]) {
    const existingCollections = await db.listCollections().toArray();

    for (const collection of collections) {
      if (existingCollections.some(({ name }) => name === collection)) {
        logger.status(
          `WARNING! Dropping existing ${collection} collection in 5 sec!`,
          true
        );

        await wait(5000);
        logger.succeed(`Collection ${collection} dropped`);
        await db.collection(collection).drop();
      }
    }
  }

  if (argv.indexes) {
    for (const collection of collections) {
      logger.status(`Ensuring indexes on ${collection} collection...`);

      await db.collection(collection).createIndexes(indexSpec[collection]);
      logger.succeed(`Indexes created on ${collection}`);
    }
  }

  const ajv = new Ajv({ verbose: true });
  ajv.addSchema(validationSchema.xml.defs);
  if (!argv["include-image-objects"]) {
    // no need to verify the item content
    delete validationSchema.xml.defs.definitions.imagesTag.properties.children
      .items;
  }
  const xmlValidators = {};
  const docValidators = {};

  if (!argv["skip-validation"]) {
    for (const collection of collections) {
      xmlValidators[collection] = ajv.compile(validationSchema.xml[collection]);
    }
  }
  if (argv["validate-docs"]) {
    for (const collection of collections) {
      docValidators[collection] = ajv.compile(validationSchema.doc[collection]);
    }
  }

  function handleInvalidRow(logPath, type, invalidRow) {
    const mssg = `Could not process ${type} with id ${invalidRow.id}: node ${
      invalidRow.reason
    }`;

    logger.warn(mssg);
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] ${mssg}\n           ${invalidRow.json}\n\n`
    );

    numInvalid++;

    if (numInvalid > argv["max-errors"]) {
      throw new Error(
        `More than ${
          argv["max-errors"]
        } rows failed to insert. Aborting processing.`
      );
    }
  }

  async function processEntries(chunk, collection, dumpFilePath) {
    const logPath = `${dumpFilePath}.log`;

    const entries = chunk.map((entry, index) => {
      let valid = true;
      if (!argv["skip-validation"]) {
        valid = xmlValidators[collection](entry, {
          verbose: true,
          extendRefs: "fail"
        });

        if (!valid) {
          const id = (() => {
            if (collection === "masters" || collection === "releases") {
              return entry.attrs.id;
            }

            const idTag =
              entry.children && entry.children.find(({ tag }) => tag === "id");

            return idTag && idTag.text;
          })();

          handleInvalidRow(logPath, collection, {
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
              )}\n\n${xmlValidators[collection].errors
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
                    targetData,
                    null,
                    "  "
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
      .filter(entry => entry.valid)
      .map(entry => {
        const doc = formatters[collection](
          entry.entry,
          argv["include-image-objects"]
        );

        if (argv["validate-docs"]) {
          const valid = docValidators[collection](doc, {
            verbose: true,
            extendRefs: "fail"
          });

          if (!valid) {
            throw new Error(
              `Invalid document with id ${doc.id}: \n\n${JSON.stringify(
                doc
              )}\n\n${docValidators[collection].errors
                .map(({ dataPath, message, schemaPath }) => {
                  let targetData = "(unable to find target data)";

                  try {
                    targetData =
                      dataPath === "[object Object]"
                        ? doc
                        : objectGet(doc, dataPath.replace(/^[^.]+\./, ""));
                  } catch (e) {
                    // nothing
                  }
                  return ` >>> ${message}:\n${JSON.stringify(
                    targetData
                  )}\n${schemaPath}\n`;
                })
                .join("\n")}\n`
            );
          }
        }

        return {
          ...entry,
          doc
        };
      });

    try {
      await db.collection(collection).bulkWrite(
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

        logger.warn(
          `Skipping insert on ${collection} with id=${doc.id}. Duplicate key.`
        );
        logger.warn(e.message);
      } else if (argv.bail) {
        throw new Error(
          `Unable to write document id=${originalIndex} to db:\n${e.code} ${
            e.message
          }`
        );
      }

      handleInvalidRow(logPath, collection, {
        json: JSON.stringify(entry),
        index: originalIndex,
        id: doc.id,
        reason
      });
    }
  }

  await processor.processDumps(
    version,
    processEntries,
    collections,
    argv["chunk-size"],
    argv.restart,
    argv["data-dir"]
  );

  logger.stopSpinner();

  await client.close();
}

module.exports = function mongo(argv) {
  // Create a new MongoClient
  const client = new MongoClient(argv.connection);

  main(argv, client).catch(e => {
    logger.error("error during processing");
    logger.stopSpinner();
    console.error(`\n${e.stack}\n`);

    return client.close();
  });
};
