import React, { useEffect, useState } from "react";
import {Box, Instance as InkInstance, Text, render} from "ink";

import DiscogsDataToolsUI from "../DiscogsDataToolsUI";

import TextBar from "./TextBar";

interface ProgressProps {
  status: UIStatus;
}

const Progress: React.FC<ProgressProps> = ({ status }) => (
  <Box margin={1} flexDirection="column" justifyContent="flex-start">
    {
      status.isFetchingData && (
        <Box marginBottom={1} flexDirection="column" justifyContent="flex-start">
          <Text>Fetching {status.fetchingUrl}</Text>
          <TextBar filledRatio={status.fetchProgress} fillColor="cyan">
            {`${status.bytesFetchedHumanReadable} / ${status.bytesTotalHumanReadable}`}
          </TextBar>
        </Box>
      )
    }
    {
      status.isParsingXML && (
        <Box marginBottom={1} flexDirection="column" justifyContent="flex-start">
          <Text>Parsing XML</Text>
          <TextBar filledRatio={status.parseXMLProgress} fillColor="yellow">
            {`${status.xmlBytesParsedHumanReadable} / ${status.uncompressedBytesTotalHumanReadable}`}
          </TextBar>
        </Box>
      )
    }
    {
      status.isStoringDocuments && (
        <Box marginBottom={1} flexDirection="column" justifyContent="flex-start">
          <Text>Storing to {status.storageEngine}</Text>
          <TextBar filledRatio={status.storeDocumentsProgress} fillColor="magenta">
            {`${status.numDocumentsStored} / ${status.numDocumentsFetched}`}
          </TextBar>
        </Box>
      )
    }
  </Box>
);

interface UIProps {
  getStatus: () => UIStatus;
}

const UI: React.FC<UIProps> = ({ getStatus }) => {
  const [status, setStatus] = useState<UIStatus>(getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(getStatus());
      setStatus(getStatus());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [getStatus]);

  return (<>
    <Box margin={1} flexDirection="column" justifyContent="flex-start">
      <Text color="green">Discogs Data Tools</Text>
    </Box>
    {
      status && <Progress status={status} />
    }
  </>)
}

class InteractiveUI extends DiscogsDataToolsUI {
  private domInstance: InkInstance | null = null;

  public stop(): void {
    if (this.domInstance) {
      this.domInstance.unmount;
    }
  }

  public start(): void {
    this.domInstance = render(<UI getStatus={this.getStatus} />);
  }
}

type UIStatus = ReturnType<InteractiveUI['getStatus']>;

export default InteractiveUI;
