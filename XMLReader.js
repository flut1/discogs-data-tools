/**
 * Code based on node-big-xml
 * https://github.com/jahewson/node-big-xml
 */
const expat = require('node-expat');
const fs = require('fs');
const events = require('events');
const zlib = require('zlib');

class XMLReader extends events.EventEmitter {
  constructor(filename, targetDepth, options) {
    super();
    options.gzip = options.gzip || false;
    this.targetDepth = targetDepth + 1;
    this.parser = new expat.Parser('UTF-8');
    this.suspended = false;
    this.stream = fs.createReadStream(filename);

    this.node = {};
    this.nodes = [];
    this.isCapturing = false;
    this.level = 0;

    if (options.gzip) {
      const gunzip = zlib.createGunzip();
      this.stream.pipe(gunzip);
      this.stream = gunzip;
    }

    this.stream.on('data', (data) => {
      this.parser.parse(data);
      this.emit('data', data);
    });

    this.parser.on('startElement', this.handleStartElement.bind(this));
    this.parser.on('text', this.handleText.bind(this));
    this.parser.on('endElement', this.handleEndElement.bind(this));
  }

  handleStartElement(name, attrs) {
    this.level++;

    if (!this.isCapturing && this.level !== this.targetDepth) {
      return;
    } else if (!this.isCapturing) {
      this.isCapturing = true;
      this.node = {};
      this.nodes = [];
      this.record = undefined;
    }

    if (this.node.children === undefined) {
      this.node.children = [];
    }

    let child = { tag: name };
    this.node.children.push(child);

    if (Object.keys(attrs).length > 0) {
      child.attrs = attrs;
    }

    this.nodes.push(this.node);
    this.node = child;

    if (this.level === this.targetDepth) {
      this.record = this.node;
    }
  }

  handleEndElement(name) {
    this.level--;
    this.node = this.nodes.pop();

    if (this.level === this.targetDepth - 1) {
      this.isCapturing = false;
      this.emit('record', this.record);
    }

    if (this.level === 0) {
      this.emit('end');
    }
  }

  handleText(txt) {
    if (!this.isCapturing) {
      return;
    }

    if (txt.trim().length > 0) {
      if (this.node.text === undefined) {
        this.node.text = txt;
      } else {
        this.node.text += txt;
      }
    }
  }

  pause() {
    this.stream.pause();
    this.suspended = true;
    if( !this.parser.pause() ) {
      throw(new Error("Cannot pause parser: "+this.parser.getError()));
    }
  }

  resume() {
    this.suspended = false;

    if( !this.parser.resume() ) {
      throw(new Error("Cannot resume parser: "+this.parser.getError()));
    }

    if( !this.suspended ) {
      this.stream.resume();
    }
  }
}

module.exports = XMLReader;
