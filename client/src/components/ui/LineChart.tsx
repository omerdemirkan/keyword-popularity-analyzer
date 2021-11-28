import React, { useEffect, useMemo, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { getPointExtremes } from "../../utils/helpers";
import { ChartPoint } from "../../utils/types";
import LineChartCursor from "./LineChartCursor";
import LineChartSVG from "./LineChartSVG";

export interface LineChartProps {
  style?: React.CSSProperties;
  points: ChartPoint[];
  displayValue?(value: number): string;
}

const LineChart: React.FC<LineChartProps> = ({
  points,
  style,
  displayValue = defaultDisplayValue,
}) => {
  const [containerRef, containerDimensions] = useDimensions<HTMLDivElement>();
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number>(0);
  const bounds = useMemo(() => getPointExtremes(points), [points]);

  useEffect(
    function () {
      const containerElement = containerRef.current;
      if (!isHovering || !containerElement) return;
      containerElement.addEventListener("mousemove", handleMouseMoved);
      return () =>
        containerElement.removeEventListener("mousemove", handleMouseMoved);
    },
    [isHovering]
  );

  function handleMouseMoved(event: MouseEvent) {
    const relativeX = event.x - containerDimensions.x;
    let newHoverIndex = Math.round(
      (relativeX / containerDimensions.width) * points.length
    );
    if (newHoverIndex < 0) newHoverIndex = 0;
    else if (newHoverIndex >= points.length) newHoverIndex = points.length - 1;

    setHoverIndex(newHoverIndex);
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl">
        {displayValue(
          isHovering
            ? points[hoverIndex].value
            : points[points.length - 1].value
        )}
      </h1>
      <div
        ref={containerRef}
        className="h-36 relative"
        style={style}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <LineChartSVG
          points={points}
          chartHeight={containerDimensions.height}
          chartWidth={containerDimensions.width}
          lowerBound={bounds.min}
          upperBound={bounds.max}
        />
        <LineChartCursor
          points={points}
          hoverIndex={hoverIndex}
          isHovering={isHovering}
          lowerBound={bounds.min}
          upperBound={bounds.max}
          startDate={points[0].date}
          endDate={points[points.length - 1].date}
        />
      </div>
    </div>
  );
};

// export default memo(ChartLine);
export default LineChart;

function defaultDisplayValue(value: number) {
  return value.toFixed(2);
}
