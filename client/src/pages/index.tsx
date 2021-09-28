import Head from "next/head";
import Chart from "../components/ui/Chart";
import { sub } from "date-fns";
import { ChartPoint } from "../components/types";

const chartPoints: ChartPoint[] = new Array(20).fill(null).map((val, i) => ({
  value: Math.random() * 100,
  date: sub(new Date(), { weeks: 19 - i }),
}));

export default function Home() {
  return (
    <div>
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>
      <Chart points={chartPoints} />
    </div>
  );
}
