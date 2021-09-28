import { differenceInMilliseconds } from "date-fns";
import React, { memo } from "react";
import { ChartPoint } from "../../utils/types";

interface LineChartSVGProps {
  points: ChartPoint[];
  chartWidth: number;
  chartHeight: number;
}

const LineChartSVG: React.FC<LineChartSVGProps> = ({
  points,
  chartWidth,
  chartHeight,
}) => {
  const { min: lowerBound, max: upperBound } = getPointExtremes(points);
  const startDate = points[0].date;
  const endDate = points[points.length - 1].date;

  const valueRange = upperBound - lowerBound;
  const msRange = differenceInMilliseconds(endDate, startDate);

  return (
    <svg height={chartHeight} width={chartWidth}>
      <polyline
        style={{
          fill: "none",
          stroke: "green",
          strokeWidth: "2px",
          strokeLinejoin: "round",
        }}
        points={points
          .map(
            ({ value, date }) =>
              `${
                (chartWidth * differenceInMilliseconds(date, startDate)) /
                msRange
              },${chartHeight * ((upperBound - value) / valueRange)}`
          )
          .join(" ")}
      />
    </svg>
  );
};
export default memo(LineChartSVG);

function getPointExtremes(points: ChartPoint[]): { max: number; min: number } {
  let max = Number.MIN_VALUE;
  let min = Number.MAX_VALUE;
  for (let i = 0; i < points.length; i++) {
    if (points[i].value < min) min = points[i].value;
    if (points[i].value > max) max = points[i].value;
  }
  return { min, max };
}
