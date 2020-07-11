import https from "https";
import expat from "node-expat";
import zlib from "zlib";
import { pipeline } from "stream";

import { getDumpURL, getLatestVersion } from "../dumps";
import { masterTransformer } from "../xmlTransformer/masterTransformers";
import XMLTransformerStream from "../xmlTransformer/XMLTransformerStream";
import { Master } from "../collections";
import ElasticWriteStream from "../storage/elastic/ElasticWriteStream";

const REQ_HEADERS = { "Accept-Encoding": "br,gzip,deflate" };

async function stream(args: any) {
  const version = await getLatestVersion();
  const dumpURL = getDumpURL(version, "masters");
  console.log("getting", dumpURL);

  const gunzip = zlib.createUnzip();
  const xmlParser = new expat.Parser("UTF-8");
  const elasticStream = new ElasticWriteStream<Master>('http://localhost:9200', 'master');

  // await elasticStream.createIndices();

  return new Promise<void>((resolve) => {
    const xmlTransformStream = new XMLTransformerStream(
      xmlParser,
      "master",
      masterTransformer
    );
    elasticStream.on("end", () => {
      console.log("END");
      resolve();
    });

    xmlTransformStream.pipe(elasticStream);

    https.get(dumpURL, { headers: REQ_HEADERS }, (response) => {
      pipeline(response, gunzip, xmlParser, (error) => {
        if (error) {
          console.error("Error while parsing XML response:");
          console.error(error);
          console.error(xmlParser.getError());
          process.exit(1);
        }
      });
    });
  });
}

export default stream;
