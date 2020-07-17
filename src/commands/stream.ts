import https from "https";
import expat from "node-expat";
import zlib from "zlib";
import { Transform } from "stream";

import { getDumpURL, getLatestVersion } from "../dumps";
import { masterTransformer } from "../xmlTransformer/masterTransformers";
import XMLTransformerStream from "../xmlTransformer/XMLTransformerStream";
import { Master } from "../collections";
import ElasticWriteStream from "../storage/elastic/ElasticWriteStream";
import getUI from "../ui/getUI";

const REQ_HEADERS = { "Accept-Encoding": "br,gzip,deflate" };

interface StreamArgs {
  d?: string;
  p?: boolean;
}

async function stream({ d: dumpVersion, p: progress = false }: StreamArgs) {
  const version = dumpVersion || (await getLatestVersion());
  const dumpURL = getDumpURL(version, "masters");
  console.log("getting", dumpURL);

  const gunzip = zlib.createUnzip();
  const xmlParser = new expat.Parser("UTF-8");

  const elasticStream = new ElasticWriteStream<Master>("master");
  await elasticStream.initializeClient("http://localhost:9200");
  // await elasticStream.createIndices();

  const xmlTransformStream = new XMLTransformerStream(
    xmlParser,
    "master",
    masterTransformer
  );

  const ui = getUI();
  ui.start();

  const reportRequestProgress = new Transform({
    transform(chunk, encoding, callback) {
      ui.addBytesFetched(chunk.length);
      callback(null, chunk);
    },
  });

  const reportGunzipProgress = new Transform({
    transform(chunk, encoding, callback) {
      ui.addUncompressedBytesTotal(chunk.length);
      callback(null, chunk);
    },
  });

  const reportXmlTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      ui.addNumDocumentsFetched(1);
      ui.setXMLBytesParsed(xmlParser.getCurrentByteIndex());
      callback(null, chunk);
    },
  });

  elasticStream.on("indexed", (amount) => {
    ui.addNumDocumentsStored(amount);
  });

  await new Promise<void>((resolve, reject) => {
    xmlTransformStream.pipe(reportXmlTransform);
    reportXmlTransform.pipe(elasticStream);

    xmlParser.on("error", (e) => {
      if (e) {
        reject(e);
      }
    });
    xmlTransformStream.on("end", () => {
      resolve();
    });

    https.get(dumpURL, { headers: REQ_HEADERS }, (response) => {
      const { headers } = response;
      const contentLength = parseInt(headers["content-length"]!, 10);
      if (isNaN(contentLength)) {
        throw new Error("Could not parse content length");
      }
      ui.setDataFetchingStarted(dumpURL, contentLength);
      ui.setIsParsingXML(true);
      ui.setIsStoringData("ElasticSearch");

      response.pipe(reportRequestProgress);
      reportRequestProgress.pipe(gunzip);
      gunzip.pipe(reportGunzipProgress);
      reportGunzipProgress.pipe(xmlParser);
    });
  });

  ui.stop();
}

export default stream;
