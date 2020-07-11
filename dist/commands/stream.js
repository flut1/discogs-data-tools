var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import https from "https";
import expat from "node-expat";
import zlib from "zlib";
import { pipeline } from "stream";
import { getDumpURL, getLatestVersion } from "../dumps";
import { masterTransformer } from "../xmlTransformer/masterTransformers";
import XMLTransformerStream from "../xmlTransformer/XMLTransformerStream";
import ElasticWriteStream from "../storage/elastic/ElasticWriteStream";
const REQ_HEADERS = { "Accept-Encoding": "br,gzip,deflate" };
function stream(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const version = yield getLatestVersion();
        const dumpURL = getDumpURL(version, "masters");
        console.log("getting", dumpURL);
        const gunzip = zlib.createUnzip();
        const xmlParser = new expat.Parser("UTF-8");
        const elasticStream = new ElasticWriteStream('http://localhost:9200', 'master');
        // await elasticStream.createIndices();
        return new Promise((resolve) => {
            const xmlTransformStream = new XMLTransformerStream(xmlParser, "master", masterTransformer);
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
    });
}
export default stream;
