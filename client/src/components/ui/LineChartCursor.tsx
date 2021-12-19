import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import { ChartPoint } from "../../utils/types";

interface LineChartCursorProps {
  points: ChartPoint[];
  cursorIndex: number;
  lowerBound?: number;
  upperBound?: number;
  startDate: Date;
  endDate: Date;
  isHidden?: boolean;
  lineColor?: string;
}

const LineChartCursor: React.FC<LineChartCursorProps> = ({
  points,
  cursorIndex,
  lowerBound,
  upperBound,
  startDate,
  endDate,
  isHidden,
  lineColor = "gray-300",
}) => {
  if (isHidden) return null;
  const point = points[cursorIndex];
  const haveVerticalBounds =
    typeof upperBound === "number" && typeof lowerBound === "number";
  const valueRange = haveVerticalBounds ? upperBound - lowerBound : null;
  const msRange = differenceInMilliseconds(startDate, endDate);
  return (
    <div
      style={{
        borderRightWidth: "1px",
        left: `${
          100 * (differenceInMilliseconds(startDate, point.date) / msRange)
        }%`,
      }}
      className={`absolute top-0 w-0 border-${lineColor} h-full`}
    >
      {haveVerticalBounds && valueRange ? (
        <span
          className="absolute w-2 h-2 rounded-full bg-primary-700 flex justify-center items-center"
          style={{
            bottom: `calc(${
              100 * ((point.value - lowerBound) / valueRange)
            }% - 4px)`,
            left: "-3px",
          }}
        />
      ) : null}
    </div>
  );
};

export default LineChartCursor;
