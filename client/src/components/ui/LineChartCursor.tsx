import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import { ChartPoint } from "../../utils/types";

interface LineChartCursorProps {
  isHovering: boolean;
  points: ChartPoint[];
  hoverIndex: number;
  lowerBound: number;
  upperBound: number;
  startDate: Date;
  endDate: Date;
}

const LineChartCursor: React.FC<LineChartCursorProps> = ({
  isHovering,
  points,
  hoverIndex,
  lowerBound,
  upperBound,
  startDate,
  endDate,
}) => {
  if (!isHovering) return null;
  const point = points[hoverIndex];
  const valueRange = upperBound - lowerBound;
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
      <span
        className="absolute w-2 h-2 rounded-full bg-primary-700 flex justify-center items-center"
        style={{
          bottom: `calc(${
            100 * ((point.value - lowerBound) / valueRange)
          }% - 4px)`,
          left: "-3px",
        }}
      />
    </div>
  );
};

export default LineChartCursor;
