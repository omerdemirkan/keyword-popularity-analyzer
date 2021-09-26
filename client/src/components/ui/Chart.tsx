import { differenceInMilliseconds, differenceInSeconds } from "date-fns";
import React from "react";
import { ChartPoint } from "../types";

export interface PriceChartProps {
  points: ChartPoint[];
  upperBound?: number;
  lowerBound?: number;
  startDate?: Date;
  endDate?: Date;
}

const Chart: React.FC<PriceChartProps> = ({
  points,
  upperBound = Math.max(...points.map((point) => point.value)),
  lowerBound = Math.min(...points.map((point) => point.value)),
  startDate = points[0].date,
  endDate = points[points.length - 1].date,
}) => {
  const timeRangeInMilliseconds = differenceInMilliseconds(startDate, endDate);
  return (
    <div className="w-36 h-36 bg-gray-100 relative">
      {points.map(({ value, date }) => (
        <span
          key={value + date.toString()}
          className="absolute w-1 h-1 bg-green-700 rounded"
          style={{
            left:
              100 *
                (differenceInMilliseconds(startDate, date) /
                  timeRangeInMilliseconds) +
              "%",
            top: 100 * ((upperBound - value) / (upperBound - lowerBound)) + "%",
            transform: "translateX(-50%)",
          }}
        ></span>
      ))}
    </div>
  );
};

export default Chart;
