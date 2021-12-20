import React, { useEffect, useMemo, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { getPointExtremes } from "../../utils/helpers";
import { ChartPoint } from "../../utils/types";
import LineChartCursor from "./LineChartCursor";
import LineChartSVG from "./LineChartSVG";

export interface LineChartProps {
  points: ChartPoint[];
  header?: React.ReactNode;
  renderHeader?(details: ChartPoint): React.ReactNode;
  artifacts?: React.ReactNode;
  renderArtifacts?(points: ChartPoint[]): React.ReactNode;
}

const LineChart: React.FC<LineChartProps> = ({
  points,
  header,
  renderHeader,
  artifacts,
  renderArtifacts,
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
      {header}
      {renderHeader &&
        renderHeader(points[isHovering ? hoverIndex : points.length - 1])}
      <div
        ref={containerRef}
        className="h-44 relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {artifacts}
        {points && renderArtifacts ? renderArtifacts(points) : null}
        <LineChartSVG
          points={points}
          chartHeight={containerDimensions.height}
          chartWidth={containerDimensions.width}
          lowerBound={bounds.min}
          upperBound={bounds.max}
        />
        <LineChartCursor
          points={points}
          cursorIndex={hoverIndex}
          isHidden={!isHovering}
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
  action?: any;
}

export const LineChartHeader: React.FC<LineChartHeaderProps> = ({
  header,
  subheader,
  action,
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center">
      <div>
        <h3 className="text-2xl font-semibold text-font-primary mb-3">
          {header}
        </h3>
        <h6 className="text-sm font-medium text-font-secondary mb-2">
          {subheader}
        </h6>
      </div>
      {action}
    </div>
  );
};

export const LineChartSkeleton: React.FC = () => {
  return <div className="w-full h-40 bg-gray-50 animate-pulse"></div>;
};

export const LineChartHeaderSkeleton: React.FC = () => {
  return (
    <div aria-label="Chart Loading Indicator animate-pulse">
      <div className="h-6 w-48 mb-3 bg-gray-50"></div>
      <div className="h-5 w-52 mb-3 bg-gray-50"></div>
    </div>
  );
};
