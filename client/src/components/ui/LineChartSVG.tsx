import { differenceInMilliseconds } from "date-fns";
import React, { memo } from "react";
import { ChartPoint } from "../../utils/types";

interface LineChartSVGProps {
  points: ChartPoint[];
  chartWidth: number;
  chartHeight: number;
  lowerBound: number;
  upperBound: number;

  // Numbers instead of dates for memoization (performance)
  startMs?: number;
  endMs?: number;
}

const LineChartSVG: React.FC<LineChartSVGProps> = ({
  points,
  chartWidth,
  chartHeight,
  lowerBound,
  upperBound,
  startMs = points[0].date.getTime(),
  endMs = points[points.length - 1].date.getTime(),
}) => {
  const startDate = new Date(startMs);
  const endDate = new Date(endMs);

  const valueRange = upperBound - lowerBound;
  const msRange = differenceInMilliseconds(endDate, startDate);

  return (
    <svg height={chartHeight} width={chartWidth}>
      <polyline
        style={{
          fill: "none",
          strokeLinejoin: "round",
        }}
        className="stroke-current text-primary-700 stroke-2"
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
