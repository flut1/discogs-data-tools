import React, {useEffect, useRef, useState} from "react";
import {DOMElement} from "ink/build/dom";
import {Box, Text, measureElement} from "ink";

const TextBar: React.FC<{
    filledRatio: number;
    fillColor: string;
    barColor?: string;
    children: string;
}> = ({ filledRatio, fillColor, barColor = "gray", children }) => {
    const ref = useRef<DOMElement>(null);
    const [boxWidth, setBoxWidth] = useState(0);

    useEffect(() => {
        const { width } = measureElement(ref.current!);
        setBoxWidth(width);
    }, []);

    const fillWidth = Math.round(boxWidth * filledRatio);
    const restWidth = boxWidth - fillWidth;
    let fillText = children.substring(0, Math.min(children.length, fillWidth));
    fillText += " ".repeat(Math.max(0, fillWidth - fillText.length));
    let restText = children.substring(fillWidth);
    restText += " ".repeat(Math.max(0, restWidth - restText.length));

    return (
        <Box width="100%" ref={ref} flexDirection="row">
            <Text color="black" backgroundColor={fillColor}>
                {fillText}
            </Text>
            <Text color="black" backgroundColor={barColor}>
                {restText}
            </Text>
        </Box>
    );
};

export default TextBar;
