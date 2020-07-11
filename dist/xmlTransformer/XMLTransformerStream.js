import { Readable } from "stream";
export default class XMLTransformerStream extends Readable {
    constructor(parser, itemTag, transformer, opts) {
        super(Object.assign(Object.assign({}, opts), { objectMode: true }));
        this.parser = parser;
        this.itemTag = itemTag;
        this.transformer = transformer;
        this.currentTransformer = null;
        this.currentItemStartIndex = 0;
        parser.on("startElement", this.tryCatcher(this.onElementStart));
        parser.on("endElement", this.tryCatcher(this.onElementEnd));
        parser.on("text", this.tryCatcher(this.onText));
        parser.on("end", () => this.push(null));
    }
    tryCatcher(fn) {
        return ((...args) => {
            try {
                return fn.apply(this, args);
            }
            catch (e) {
                console.error(e);
                process.exit(1);
            }
        });
    }
    _read() {
    }
    onElementStart(name, attributes) {
        if (name !== this.itemTag) {
            if (this.currentTransformer) {
                this.currentTransformer.onElementStart(name, attributes);
            }
            return;
        }
        if (this.currentTransformer) {
            throw new Error(`Cannot start new element <${name}>, tag <${this.itemTag}> is still open`);
        }
        this.currentItemStartIndex = this.parser.getCurrentByteIndex();
        this.currentTransformer = this.transformer(name, attributes);
    }
    onElementEnd(name) {
        if (!this.currentTransformer) {
            throw new Error(`Unexpected element end </${name}>, no tag <${this.itemTag}> open`);
        }
        const result = this.currentTransformer.onElementEnd(name);
        if (result !== null) {
            this.currentTransformer = null;
            this.push(result);
        }
        return result;
    }
    onText(content) {
        if (this.currentTransformer) {
            return this.currentTransformer.onText(content);
        }
        return;
    }
}
