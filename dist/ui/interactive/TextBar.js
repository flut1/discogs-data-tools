import React, { useEffect, useRef, useState } from "react";
import { Box, measureElement, Text } from "ink";
const TextBar = ({ filledRatio, fillColor, barColor = "gray", children }) => {
    const ref = useRef(null);
    const [boxWidth, setBoxWidth] = useState(0);
    useEffect(() => {
        const { width } = measureElement(ref.current);
        setBoxWidth(width);
    }, []);
    const fillWidth = Math.round(boxWidth * filledRatio);
    const restWidth = boxWidth - fillWidth;
    let fillText = children.substring(0, Math.min(children.length, fillWidth));
    fillText += " ".repeat(Math.max(0, fillWidth - fillText.length));
    let restText = children.substring(fillWidth);
    restText += " ".repeat(Math.max(0, restWidth - restText.length));
    return (React.createElement(Box, { width: "100%", ref: ref, flexDirection: "row" },
        React.createElement(Text, { color: "black", backgroundColor: fillColor }, fillText),
        React.createElement(Text, { color: "black", backgroundColor: barColor }, restText)));
};
export default TextBar;
