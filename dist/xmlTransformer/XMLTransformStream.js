import { Writable, pipeline } from "stream";
export default class XMLTransformStream extends Writable {
    constructor(pipelineParam, itemTag, transformer, opts) {
        super(opts);
        this.itemTag = itemTag;
        this.transformer = transformer;
        this.bufferLength = 0;
        this.processed = 0;
        this.buffer = [];
        this.pipeline = pipelineParam;
        pipeline(this.pipeline);
    }
    _write(chunk, encoding, callback) {
        this.bufferLength += chunk.length;
        this.pipeline[0].write(chunk, encoding, this.handleWriteComplete);
        callback();
    }
    handleWriteComplete() {
        console.log(this.bufferLength);
        this.processed += this.bufferLength;
        this.bufferLength = 0;
    }
}
