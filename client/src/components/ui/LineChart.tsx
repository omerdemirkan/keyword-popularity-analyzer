import React, { useEffect, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { ChartPoint } from "../../utils/types";
import LineChartSVG from "./LineChartSVG";

export interface LineChartProps {
  style?: React.CSSProperties;
  points: ChartPoint[];
}

const LineChart: React.FC<LineChartProps> = ({ points, style }) => {
  const [containerRef, containerDimensions] = useDimensions<HTMLDivElement>();
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number>(0);

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
    let newHoverIndex = Math.round(
      (event.offsetX / containerDimensions.width) * points.length
    );
    if (newHoverIndex < 0) newHoverIndex = 0;
    else if (newHoverIndex >= points.length) newHoverIndex = points.length - 1;

    setHoverIndex(newHoverIndex);
  }

  return (
    <div className="w-full max-w-xl">
      <h1 className="text-2xl">
        {isHovering
          ? points[hoverIndex].value.toFixed(2)
          : points[points.length - 1].value.toFixed(2)}
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
        />
      </div>
    </div>
  );
};

// export default memo(ChartLine);
export default LineChart;
