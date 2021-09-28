import React from "react";
import useDimensions from "../../hooks/useDimensions";
import { ChartPoint } from "../../utils/types";
import LineChartSVG from "./LineChartSVG";

export interface LineChartProps {
  style?: React.CSSProperties;
  points: ChartPoint[];
}

const LineChart: React.FC<LineChartProps> = ({ points, style }) => {
  const [containerRef, containerDimensions] = useDimensions<HTMLDivElement>();
  return (
    <div
      ref={containerRef}
      className="h-36 w-full max-w-2xl flex justify-center items-center"
      style={style}
    >
      <LineChartSVG
        points={points}
        chartHeight={containerDimensions.height}
        chartWidth={containerDimensions.width}
      />
    </div>
  );
};

// export default memo(ChartLine);
export default LineChart;
