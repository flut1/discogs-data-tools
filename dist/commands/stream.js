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
const REQ_HEADERS = { "Accept-Encoding": "br,gzip,deflate" };
function stream(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const version = yield getLatestVersion();
        const dumpURL = getDumpURL(version, "masters");
        console.log("getting", dumpURL);
        const gunzip = zlib.createUnzip();
        const xmlParser = new expat.Parser("UTF-8");
        return new Promise((resolve) => {
            const xmlTransformStream = new XMLTransformerStream(xmlParser, "master", masterTransformer);
            let count = 0;
            xmlTransformStream.on('data', (data) => {
                count++;
                if (count % 1000 === 0) {
                    console.log(data);
                }
            });
            xmlTransformStream.on('end', () => {
                console.log('END');
                resolve();
            });
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
        // const xmlParser = new expat.Parser("UTF-8");
        // const gunzip = zlib.createUnzip();
        //
        // const transformer = getRootTransformer("masters", (err, master) => {
        //   if (err) {
        //     console.error(err);
        //     process.exit(1);
        //   }
        //   console.log(master);
        // });
        // const transformerState = transformer("root", {});
        // xmlParser.on("startElement", transformerState.onElementStart);
        // xmlParser.on("endElement", transformerState.onElementEnd);
        // xmlParser.on("text", transformerState.onText);
        // https.get(dumpURL, { headers: REQ_HEADERS }, (response) => {
        //   pipeline(response, gunzip, xmlParser, (err) => {
        //     console.error("Error while parsing XML response:");
        //     console.error(err);
        //     process.exit(1);
        //   });
        // });
        // const xmlParser = new expat.Parser("UTF-8");
        // const transformer = getRootTransformer("masters", (err, master) => {
        //   if (err) {
        //     console.error(err);
        //     process.exit(1);
        //   }
        //   console.log(master);
        // });
        // const stringDecoder = new StringDecoderTransform('ascii');
        // const transformerState = transformer("root", {});
        // xmlParser.on("startElement", transformerState.onElementStart);
        // xmlParser.on("endElement", transformerState.onElementEnd);
        // xmlParser.on("text", transformerState.onText);
        // const stream = fs.createReadStream('./smallermasters.xml');
        // pipeline(stream, xmlParser, (err) => {
        //   if (err) {
        //     console.error("Error while parsing XML response:");
        //     console.error(err);
        //     console.error(xmlParser.getError());
        //     process.exit(1);
        //   }
        // });
    });
}
export default stream;
