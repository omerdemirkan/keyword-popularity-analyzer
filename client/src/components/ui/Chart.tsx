import { differenceInMilliseconds, differenceInSeconds } from "date-fns";
import React from "react";
import { ChartPoint } from "../types";

export interface PriceChartProps {
  points: ChartPoint[];
  startDate?: Date;
  endDate?: Date;
  height?: number;
}

const Chart: React.FC<PriceChartProps> = ({
  points,
  startDate = points[0].date,
  endDate = points[points.length - 1].date,
  height = 400,
}) => {
  const upperBound = Math.max(...points.map((point) => point.value));
  const lowerBound = Math.min(...points.map((point) => point.value));
  const valueRange = upperBound - lowerBound;
  const msRange = differenceInMilliseconds(endDate, startDate);
  const width = 400;
  return (
    <div>
      <svg height={`${height}px`} width="">
        <polyline
          style={{ fill: "none", stroke: "green", strokeWidth: "2px" }}
          points={points
            .map(
              ({ value, date }) =>
                `${
                  (width * differenceInMilliseconds(date, startDate)) / msRange
                },${height * ((upperBound - value) / valueRange)}`
            )
            .join(" ")}
        />
      </svg>
    </div>
  );
};

export default Chart;
