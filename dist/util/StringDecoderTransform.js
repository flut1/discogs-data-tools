import { Transform } from "stream";
import { StringDecoder } from "string_decoder";
export default class StringDecoderTransform extends Transform {
    constructor(encoding, opts) {
        super(opts);
        this.decoder = new StringDecoder(encoding);
    }
    _write(chunk, encoding, callback) {
        try {
            const data = this.decoder.write(chunk);
            this.push(data);
        }
        catch (e) {
            callback(e);
            return;
        }
        callback();
    }
}
