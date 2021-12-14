import React, { useEffect, useMemo, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { getPointExtremes } from "../../utils/helpers";
import { ChartPoint } from "../../utils/types";
import LineChartCursor from "./LineChartCursor";
import LineChartSVG from "./LineChartSVG";

export interface LineChartProps {
  style?: React.CSSProperties;
  points: ChartPoint[];
  renderHeader?(details: ChartPoint): React.ReactNode;
}

const LineChart: React.FC<LineChartProps> = ({
  points,
  style,
  renderHeader,
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
      {renderHeader &&
        renderHeader(points[isHovering ? hoverIndex : points.length - 1])}
      <div
        ref={containerRef}
        className="h-44 relative"
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

export interface LineChartHeaderProps {
  header: string;
  subheader: string;
}

export const LineChartHeader: React.FC<LineChartHeaderProps> = ({
  header,
  subheader,
}) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-font-primary mb-3">
        {header}
      </h3>
      <h6 className="text-sm font-medium text-font-secondary">{subheader}</h6>
    </div>
  );
};

export const LineChartSkeleton: React.FC = () => {
  return <div className="w-full h-44 bg-gray-300"></div>;
};

export const LineChartHeaderSkeleton: React.FC = () => {
  return (
    <div>
      <span className="h-5 mb-5 bg-font-primary"></span>
      <span className="h-4 mb-4 bg-font-secondary"></span>
    </div>
  );
};
