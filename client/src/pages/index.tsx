import Head from "next/head";
import LineChart from "../components/ui/LineChart";
import { sub } from "date-fns";
import { ChartPoint } from "../utils/types";

const numElements = 1000;
const now = new Date();
const chartPoints: ChartPoint[] = [
  { date: sub(now, { weeks: numElements - 1 }), value: 0 },
];
for (let i = 1; i < numElements; i++) {
  chartPoints.push({
    value:
      chartPoints[chartPoints.length - 1].value +
      (Math.random() >= 0.5 ? 1 : -1) * (Math.pow(Math.random(), 2) * 12),
    date: sub(now, { weeks: numElements - 1 - i }),
  });
}

export default function Home() {
  return (
    <div>
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>
      <LineChart points={chartPoints} />
    </div>
  );
}
