import DiscogsDataToolsUI from "../DiscogsDataToolsUI";
import React, { useEffect, useState } from "react";
import { Box, render, Text } from "ink";
import TextBar from "./TextBar";
const Progress = ({ status }) => (React.createElement(Box, { margin: 1, flexDirection: "column", justifyContent: "flex-start" },
    status.isFetchingData && (React.createElement(Box, { marginBottom: 1, flexDirection: "column", justifyContent: "flex-start" },
        React.createElement(Text, null,
            "Fetching ",
            status.fetchingUrl),
        React.createElement(TextBar, { filledRatio: status.fetchProgress, fillColor: "cyan" }, `${status.bytesFetchedHumanReadable} / ${status.bytesTotalHumanReadable}`))),
    status.isParsingXML && (React.createElement(Box, { marginBottom: 1, flexDirection: "column", justifyContent: "flex-start" },
        React.createElement(Text, null, "Parsing XML"),
        React.createElement(TextBar, { filledRatio: status.parseXMLProgress, fillColor: "yellow" }, `${status.xmlBytesParsedHumanReadable} / ${status.uncompressedBytesTotalHumanReadable}`))),
    status.isStoringDocuments && (React.createElement(Box, { marginBottom: 1, flexDirection: "column", justifyContent: "flex-start" },
        React.createElement(Text, null,
            "Storing to ",
            status.storageEngine),
        React.createElement(TextBar, { filledRatio: status.storeDocumentsProgress, fillColor: "magenta" }, `${status.numDocumentsStored} / ${status.numDocumentsFetched}`)))));
const UI = ({ getStatus }) => {
    const [status, setStatus] = useState(getStatus());
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(getStatus());
            setStatus(getStatus());
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [getStatus]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Box, { margin: 1, flexDirection: "column", justifyContent: "flex-start" },
            React.createElement(Text, { color: "green" }, "Discogs Data Tools")),
        status && React.createElement(Progress, { status: status })));
};
class InteractiveUI extends DiscogsDataToolsUI {
    constructor() {
        super(...arguments);
        this.domInstance = null;
    }
    stop() {
        if (this.domInstance) {
            this.domInstance.unmount;
        }
    }
    start() {
        this.domInstance = render(React.createElement(UI, { getStatus: this.getStatus }));
    }
}
export default InteractiveUI;
