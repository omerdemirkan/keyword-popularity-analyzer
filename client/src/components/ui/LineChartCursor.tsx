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
}

const LineChartCursor: React.FC<LineChartCursorProps> = ({
  points,
  cursorIndex,
  lowerBound,
  upperBound,
  startDate,
  endDate,
  isHidden,
}) => {
  if (isHidden) return null;
  const point = points[cursorIndex];
  const valueRange =
    typeof upperBound === "number" && typeof lowerBound === "number"
      ? upperBound - lowerBound
      : null;
  const msRange = differenceInMilliseconds(startDate, endDate);
  return (
    <div
      style={{
        borderRightWidth: "1px",
        left: `${
          100 * (differenceInMilliseconds(startDate, point.date) / msRange)
        }%`,
      }}
      className="absolute top-0 w-0 border-gray-300 h-full"
    >
      {valueRange && typeof lowerBound === "string" ? (
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
