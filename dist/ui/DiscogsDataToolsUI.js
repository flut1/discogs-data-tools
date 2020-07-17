function bytesToHumanReadable(bytes) {
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
class DiscogsDataToolsUI {
    constructor() {
        this.numDocumentsFetched = 0;
        this.numDocumentsStored = 0;
        this.bytesFetched = 0;
        this.bytesTotal = 0;
        this.xmlBytesParsed = 0;
        this.uncompressedBytesTotal = 0;
        this.fetchingUrl = null;
        this.isParsingXML = false;
        this.storageEngine = null;
        this.getStatus = () => {
            const { numDocumentsFetched, numDocumentsStored, bytesFetched, bytesTotal, xmlBytesParsed, uncompressedBytesTotal, storeDocumentsProgress, fetchProgress, parseXMLProgress, bytesFetchedHumanReadable, bytesTotalHumanReadable, xmlBytesParsedHumanReadable, uncompressedBytesTotalHumanReadable, isFetchingData, isStoringDocuments, isParsingXML, fetchingUrl, storageEngine, } = this;
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
    setDataFetchingStarted(url, bytesTotal) {
        this.bytesTotal = bytesTotal;
        this.fetchingUrl = url;
    }
    setIsStoringData(storageEngine) {
        this.storageEngine = storageEngine;
    }
    setIsParsingXML(isParsingXML = true) {
        this.isParsingXML = isParsingXML;
    }
    setNumDocumentsFetched(n) {
        this.numDocumentsFetched = n;
    }
    addNumDocumentsFetched(n) {
        this.numDocumentsFetched += n;
    }
    setNumDocumentsStored(n) {
        this.numDocumentsStored = n;
    }
    addNumDocumentsStored(n) {
        this.numDocumentsStored += n;
    }
    setBytesFetched(n) {
        this.bytesFetched = n;
    }
    setXMLBytesParsed(n) {
        this.xmlBytesParsed = n;
    }
    setUncompressedBytesTotal(n) {
        this.uncompressedBytesTotal = n;
    }
    addUncompressedBytesTotal(n) {
        this.uncompressedBytesTotal += n;
    }
    addBytesFetched(n) {
        this.bytesFetched += n;
    }
    get isFetchingData() {
        return this.fetchingUrl !== null;
    }
    get isStoringDocuments() {
        return this.storageEngine !== null;
    }
    get bytesFetchedHumanReadable() {
        return bytesToHumanReadable(this.bytesFetched);
    }
    get bytesTotalHumanReadable() {
        return bytesToHumanReadable(this.bytesTotal);
    }
    get xmlBytesParsedHumanReadable() {
        return bytesToHumanReadable(this.xmlBytesParsed);
    }
    get uncompressedBytesTotalHumanReadable() {
        return bytesToHumanReadable(this.uncompressedBytesTotal);
    }
    get storeDocumentsProgress() {
        return this.numDocumentsStored / this.numDocumentsFetched;
    }
    get fetchProgress() {
        return this.bytesFetched / this.bytesTotal;
    }
    get parseXMLProgress() {
        return this.xmlBytesParsed / this.uncompressedBytesTotal;
    }
}
export default DiscogsDataToolsUI;
