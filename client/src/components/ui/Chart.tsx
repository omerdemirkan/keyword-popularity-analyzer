import { differenceInMilliseconds } from "date-fns";
import React from "react";
import useDimensions from "../../hooks/useDimensions";
import { ChartPoint } from "../types";

export interface PriceChartProps {
  points: ChartPoint[];
  style?: React.CSSProperties;
}

const Chart: React.FC<PriceChartProps> = ({ points, style }) => {
  const [containerRef, containerDimensions] = useDimensions();

  const { min: lowerBound, max: upperBound } = findPointExtremes(points);
  const startDate = points[0].date;
  const endDate = points[points.length - 1].date;

  const valueRange = upperBound - lowerBound;
  const msRange = differenceInMilliseconds(endDate, startDate);
  const chartWidth = containerDimensions.width;
  const chartHeight = containerDimensions.height - 2;

  return (
    <div
      ref={containerRef}
      style={{
        height: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <svg height={chartHeight} width={chartWidth}>
        <polyline
          className=""
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
    </div>
  );
};

export default Chart;

function findPointExtremes(points: ChartPoint[]): { max: number; min: number } {
  let max = Number.MIN_VALUE;
  let min = Number.MAX_VALUE;
  for (let i = 0; i < points.length; i++) {
    if (points[i].value < min) min = points[i].value;
    if (points[i].value > max) max = points[i].value;
  }
  return { min, max };
}
