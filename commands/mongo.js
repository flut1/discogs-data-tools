const processor = require('../processor');
const fs = require('fs-extra');
const Ajv = require('ajv');
const MongoClient = require('mongodb').MongoClient;
const labelSchema = require('../schema/label-xml.json');

// Connection URL
const MONGO_URL = 'mongodb://root:development@localhost:27017';

// Database Name
const DB_NAME = 'discogs';

async function main(argv) {
  // Create a new MongoClient
  const client = new MongoClient(MONGO_URL);

  const ajv = new Ajv({ verbose: true });
  if (!argv.includeImageObjects) {
    // no need to verify the item content
    delete labelSchema.properties.children.items.oneOf[0].properties.children.items;
  }
  const validateLabel = ajv.compile(labelSchema);


  // Use connect method to connect to the Server
  try {
    await client.connect();
  } catch (e) {
    throw new Error(`Could not connect to MongoDB: ${e}`);
  }
  console.log("Connected successfully to server");
  const db = client.db(DB_NAME);

  function labelXMLToDocument(label) {
    const res = {
      imageCount: 0,
      urls: [],
      subLabels: []
    };
    label.children.forEach(child => {
      switch (child.tag) {
        case 'images':
          if (argv.includeImageObjects) {
            res.images = child.children.map(({ attrs: { width, height, type, uri, uri150 } }) => ({
              width: width ? parseInt(width, 10) : 0,
              height: height ? parseInt(height, 10) : 0,
              type,
              uri,
              uri150
            }));
          }

          res.imageCount = child.children.length;
          break;
        case 'id':
          res.id = parseInt(child.text, 10);
          break;
        case 'urls':
          res.urls = child.children.map(({ text }) => text).filter(_ => _);
          break;
        case 'sublabels':
          res.subLabels = child.children.map(({ text, attrs }) => ({
            name: text,
            id: parseInt(attrs.id, 10)
          }));
          break;
        case 'parentLabel':
          res.parent = {
            id: parseInt(child.attrs.id, 10),
            name: child.text
          };
          break;
        case 'name':
          const nameIndexMatch = child.text.match(/^(.+?)(?:\s?\((\d+)\))?$/);

          if (!nameIndexMatch) {
            throw new Error('Expected name to match regex pattern');
          }
          res.originalName = child.text;
          res.nameIndex = nameIndexMatch[2] ? parseInt(nameIndexMatch[2]) : 1;
          res.name = nameIndexMatch[1];
          break;
        case 'profile':
        case 'contactinfo':
          res[child.tag] = child.text || '';
          break;
        case 'data_quality':
          res.dataQuality = child.text || '';
          break;
        default:
          throw new Error(`Unexpected child tag "${child.tag.name}"`);
      }
    });

    return res;
  }

  const processors = {
    labels: async function processLabels(chunk) {

      for (const entry of chunk) {
        if (!argv.noValidate) {
          const valid =  validateLabel(entry);

          if (!valid) {
            const lastError = validateLabel.errors[validateLabel.errors.length - 1];
            console.log(validateLabel.errors);
            console.log(JSON.stringify(lastError.data, null, '  '));
            console.log(JSON.stringify(entry, null, '  '));
            throw new Error();
          }
        }
      }

      const documents = chunk.map(labelXMLToDocument);

      await db.collection('labels').bulkWrite(
        documents.map(doc => ({
          updateOne: {
            filter: { id: doc.id },
            upsert: true,
            update: doc
          }
        }))
      );
      // await db.collection('labels').insertMany(documents);
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

  if (!argv.noIndex) {
    console.log('Ensuring indexes on labels collection...');
    await db.collection('labels').createIndexes([
      { key: { id: 1 }, unique: true },
      { key: { 'subLabels.id': 1 } },
      { key: { parent: 1 } },
      { key: { name: 'text' } },
      { key: { originalName: 1 }, unique: true },
      { key: { name: 1, nameIndex: 1 } },
    ]);
  }

  await processor.processDumps(argv.dumpVersion, argv.types, processEntries, argv.chunkSize, argv.restart);
  client.close();
}

module.exports = function(argv) {
  main(argv).catch(e => console.error(e));
};
