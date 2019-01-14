const processor = require('../processor');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const MONGO_URL = 'mongodb://root:development@localhost:27017';

// Database Name
const DB_NAME = 'discogs';

async function main(argv) {
  // Create a new MongoClient
  const client = new MongoClient(MONGO_URL);

  // Use connect method to connect to the Server
  try {
    await client.connect();
  } catch (e) {
    throw new Error(`Could not connect to MongoDB: ${e}`);
  }
  console.log("Connected successfully to server");
  const db = client.db(DB_NAME);

  const processors = {
    labels: async function processLabels(chunk) {
      await db.collection('labels').bulkWrite(
        chunk.map(entry => ({
          updateOne: {
            filter: { _id: entry.children.find(({ tag }) => tag === 'id').text },
            upsert: true,
            update: {
              _id: entry.children.find(({ tag }) => tag === 'id').text,
              name: entry.children.find(({ tag }) => tag === 'name').text
            }
          }
        }))
      );

      throw new Error();
    },
    artist: async function processArtists(chunk) {

      throw new Error();
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

  await processor.processDumps(argv.dumpVersion, argv.types, processEntries, argv.chunkSize);
  client.close();
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};