import { Client } from "@elastic/elasticsearch";
import { Writable } from "stream";
import wait from "../../util/wait";

export default class ElasticWriteStream<
  T extends { id: number }
> extends Writable {
  private client: Client | undefined;

  constructor(public index: string) {
    super({
      objectMode: true,
      highWaterMark: 10000,
    });
  }

  public async initializeClient(nodeAddress: string) {
    if (!this.client) {
      this.client = new Client({ node: nodeAddress });
    }
  }

  public _writev(
    chunks: Array<{ chunk: T }>,
    callback: (error?: Error | null) => void
  ): void {
    this.cork();

    const putDocs = this.putDocs(chunks.map((c) => c.chunk)).then(() => {
      callback();
    });

    Promise.all([putDocs, wait(1000)]).then(() => {
      this.uncork();
    });
  }

  public async putDocs(docs: Array<T>) {
    if (!this.client) {
      throw new Error('ElasticSearch client not initialized');
    }

    const body = docs.flatMap(({ id, ...docRest }) => [
      { index: { _index: this.index, _id: id } },
      {
        ...docRest,
      },
    ]);

    const { body: bulkResponse } = await this.client.bulk({
      refresh: "true",
      body,
    });

    // console.log(`Indexed ${docs.length} documents in index "${this.index}"`);
    this.emit('indexed', docs.length);

    if (bulkResponse.errors) {
      const erroredDocuments: Array<any> = [];
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action: any, i: number) => {
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
  }

  public async createIndices() {
    if (!this.client) {
      throw new Error('ElasticSearch client not initialized');
    }
    const { body: respDeleteIndex } = await this.client.indices.delete({
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

    const resp = await this.client.indices.create(
      {
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
      },
      { ignore: [400] }
    );
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
  }
}
