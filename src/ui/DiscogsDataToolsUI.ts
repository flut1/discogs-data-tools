import {ExcludeProperties, FilterProperties} from "../util/utilTypes";

function bytesToHumanReadable(bytes: number) {
  const fixedDigits = 2;
  const kbs = bytes / 1024;
  const megs = kbs / 1024;
  const gigs = megs / 1024;

  if (gigs > 1.2) {
    return `${gigs.toFixed(fixedDigits)}gb`;
  }

  if (megs > 1.2) {
    return `${megs.toFixed(fixedDigits)}mb`;
  }

  if (kbs > 1.2) {
    return `${kbs.toFixed(fixedDigits)}kb`;
  }

  return `${bytes} bytes`;
}

abstract class DiscogsDataToolsUI {
  private numDocumentsFetched = 0;
  private numDocumentsStored = 0;
  private bytesFetched = 0;
  private bytesTotal = 0;
  private xmlBytesParsed = 0;
  private uncompressedBytesTotal = 0;
  private fetchingUrl: string | null = null;
  private isParsingXML = false;
  private storageEngine: string | null = null;

  public setDataFetchingStarted(url: string, bytesTotal: number) {
    this.bytesTotal = bytesTotal;
    this.fetchingUrl = url;
  }

  public setIsStoringData(storageEngine: string | null) {
    this.storageEngine = storageEngine;
  }

  public setIsParsingXML(isParsingXML = true) {
    this.isParsingXML = isParsingXML;
  }

  public setNumDocumentsFetched(n: number) {
    this.numDocumentsFetched = n;
  }

  public addNumDocumentsFetched(n: number) {
    this.numDocumentsFetched += n;
  }

  public setNumDocumentsStored(n: number) {
    this.numDocumentsStored = n;
  }

  public addNumDocumentsStored(n: number) {
    this.numDocumentsStored += n;
  }

  public setBytesFetched(n: number) {
    this.bytesFetched = n;
  }

  public setXMLBytesParsed(n: number) {
    this.xmlBytesParsed = n;
  }

  public setUncompressedBytesTotal(n: number) {
    this.uncompressedBytesTotal = n;
  }

  public addUncompressedBytesTotal(n: number) {
    this.uncompressedBytesTotal += n;
  }

  public addBytesFetched(n: number) {
    this.bytesFetched += n;
  }

  public get isFetchingData() {
    return this.fetchingUrl !== null;
  }

  public get isStoringDocuments() {
    return this.storageEngine !== null;
  }

  public get bytesFetchedHumanReadable() {
    return bytesToHumanReadable(this.bytesFetched);
  }

  public get bytesTotalHumanReadable() {
    return bytesToHumanReadable(this.bytesTotal);
  }

  public get xmlBytesParsedHumanReadable() {
    return bytesToHumanReadable(this.xmlBytesParsed);
  }

  public get uncompressedBytesTotalHumanReadable() {
    return bytesToHumanReadable(this.uncompressedBytesTotal);
  }

  public get storeDocumentsProgress() {
    return this.numDocumentsStored / this.numDocumentsFetched;
  }

  public get fetchProgress() {
    return this.bytesFetched / this.bytesTotal;
  }

  public get parseXMLProgress() {
    return this.xmlBytesParsed / this.uncompressedBytesTotal;
  }

  public abstract start(): void;

  public abstract stop(): void;

  public getStatus = () => {
    const {
      numDocumentsFetched,
      numDocumentsStored,
      bytesFetched,
      bytesTotal,
      xmlBytesParsed,
      uncompressedBytesTotal,
      storeDocumentsProgress,
      fetchProgress,
      parseXMLProgress,
      bytesFetchedHumanReadable,
      bytesTotalHumanReadable,
      xmlBytesParsedHumanReadable,
      uncompressedBytesTotalHumanReadable,
      isFetchingData,
      isStoringDocuments,
      isParsingXML,
      fetchingUrl,
      storageEngine,
    } = this;

    return {
      numDocumentsFetched,
      numDocumentsStored,
      bytesFetched,
      bytesTotal,
      xmlBytesParsed,
      uncompressedBytesTotal,
      storeDocumentsProgress,
      fetchProgress,
      parseXMLProgress,
      bytesFetchedHumanReadable,
      bytesTotalHumanReadable,
      xmlBytesParsedHumanReadable,
      uncompressedBytesTotalHumanReadable,
      isFetchingData,
      isStoringDocuments,
      isParsingXML,
      fetchingUrl,
      storageEngine,
    };
  };
}

export default DiscogsDataToolsUI;
