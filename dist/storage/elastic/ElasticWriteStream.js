var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Client } from "@elastic/elasticsearch";
import { Writable } from "stream";
import wait from "../../util/wait";
export default class ElasticWriteStream extends Writable {
    constructor(nodeAddress, index) {
        super({
            objectMode: true,
            highWaterMark: 10000,
        });
        this.index = index;
        this.client = new Client({ node: nodeAddress });
    }
    _writev(chunks, callback) {
        this.cork();
        console.log("_writev", chunks.length);
        const putDocs = this.putDocs(chunks.map((c) => c.chunk)).then(() => {
            callback();
        });
        Promise.all([putDocs, wait(1000)]).then(() => {
            this.uncork();
        });
    }
    createIndices() {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: respDeleteIndex } = yield this.client.indices.delete({
                index: '*',
            });
            console.log('delete index');
            console.log(respDeleteIndex);
            // const { body: respDelete } = await this.client.deleteByQuery({
            //   index: this.index,
            //   body: {
            //     query: {
            //       match_all: {},
            //     },
            //   },
            // });
            // console.log('delete documents');
            // console.log(respDelete);
            const resp = yield this.client.indices.create({
                index: this.index,
                body: {
                    mappings: {
                        properties: {
                            id: { type: "integer" },
                            mainRelease: { type: "integer" },
                            artists: {
                                type: "nested",
                                properties: {
                                    id: { type: "integer" },
                                    anv: {
                                        type: "nested",
                                        properties: {
                                            name: { type: "text" },
                                            nameIndex: { type: "short" },
                                        },
                                    },
                                    tracks: { type: "text" },
                                },
                            },
                            styles: { type: "keyword" },
                            genres: { type: "keyword" },
                            videos: {
                                type: "nested",
                                properties: {
                                    title: { type: "text" },
                                    description: { type: "text" },
                                    duration: { type: "integer" },
                                    originalDuration: { type: "text" },
                                    src: { type: "keyword" },
                                },
                            },
                            title: { type: "text" },
                            year: { type: "short" },
                            dataQuality: { type: "keyword" },
                            notes: { type: "text" },
                        },
                    },
                },
            }, { ignore: [400] });
            console.log("indices created");
            console.log(resp.body);
            // const resp = await this.client.search({
            //   index: this.index,
            //   body: {
            //     query: {
            //       match_all: {}
            //     }
            //   }
            // });
            // console.log(resp);
            throw new Error("NIOPE");
        });
    }
    putDocs(docs) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = docs.flatMap((_a) => {
                var { id } = _a, docRest = __rest(_a, ["id"]);
                return [
                    { index: { _index: this.index } },
                    Object.assign({ id: id }, docRest),
                ];
            });
            const { body: bulkResponse } = yield this.client.bulk({
                refresh: "true",
                body,
            });
            console.log(`Indexed ${docs.length} documents in index "${this.index}"`);
            if (bulkResponse.errors) {
                const erroredDocuments = [];
                // The items array has the same order of the dataset we just indexed.
                // The presence of the `error` key indicates that the operation
                // that we did for the document has failed.
                bulkResponse.items.forEach((action, i) => {
                    const operation = Object.keys(action)[0];
                    if (action[operation].error) {
                        erroredDocuments.push({
                            // If the status is 429 it means that you can retry the document,
                            // otherwise it's very likely a mapping error, and you should
                            // fix the document before to try it again.
                            status: action[operation].status,
                            error: action[operation].error,
                            operation: body[i * 2],
                            document: body[i * 2 + 1],
                        });
                    }
                });
                console.log(erroredDocuments);
            }
        });
    }
}
