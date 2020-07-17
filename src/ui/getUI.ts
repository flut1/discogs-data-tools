import DiscogsDataToolsUI from "./DiscogsDataToolsUI";
import InteractiveUI from "./interactive/InteractiveUI";

export default function getUI(): DiscogsDataToolsUI {
  return new InteractiveUI();
}
