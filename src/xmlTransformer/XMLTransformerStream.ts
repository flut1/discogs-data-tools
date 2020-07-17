import {Readable, ReadableOptions} from "stream";
import {Parser} from "node-expat";

import {IGNORE_NODE, XMLTransformer} from "./xmlTransformer";

export default class XMLTransformerStream<T> extends Readable implements XMLTransformer.State<T> {
  private currentTransformer: XMLTransformer.State<T> | null = null;
  private nonItemNodes: Array<string> = [];

  constructor(
    private parser: Parser,
    private itemTag: string,
    private transformer: XMLTransformer<T>,
    opts?: Omit<ReadableOptions, 'objectMode'|'encoding'>
  ) {
    super({...opts, objectMode: true});

    parser.on("startElement", this.tryCatcher(this.onElementStart));
    parser.on("endElement", this.tryCatcher(this.onElementEnd));
    parser.on("text", this.tryCatcher(this.onText));
    parser.on("end", () => this.push(null))
  }

  private tryCatcher<T extends (...args: Array<any>) => any>(fn: T): T {
    return ((...args: Array<any>) => {
      try {
        return fn.apply(this, args);
      } catch(e) {
        console.error(e);
        process.exit(1);
      }
    }) as T;
  }

  public _read() {
  }

  public onElementStart(name: string, attributes: XMLTransformer.Attributes) {
    if (name !== this.itemTag) {
      if (this.currentTransformer) {
        this.currentTransformer.onElementStart(name, attributes);
        return;
      }
      this.nonItemNodes.push(name);
      return;
    }
    if (this.currentTransformer) {
      throw new Error(`Cannot start new element <${name}>, tag <${this.itemTag}> is still open`);
    }
    this.currentTransformer = this.transformer(name, attributes);
  }

  public onElementEnd(name: string): T | XMLTransformer.IgnoreNodeSymbol | null {
    if (!this.currentTransformer) {
      if (!this.nonItemNodes.length || this.nonItemNodes.pop() !== name) {
        throw new Error(`Unexpected element end </${name}>, no tag <${this.itemTag}> open`);
      }
      return null;
    }

    const result = this.currentTransformer.onElementEnd(name);

    if (result !== null) {
      this.currentTransformer = null;
      if (result !== IGNORE_NODE) {
        this.push(result);
      }
    }

    return result;
  }

  public onText(content: string) {
    if (this.currentTransformer) {
      return this.currentTransformer.onText(content);
    }
    return;
  }
}
