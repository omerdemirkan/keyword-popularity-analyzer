import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { ChartPoint } from "../types";

const getKeywordTrend = httpsCallable(functions, "getKeywordTrend");
export async function fetchKeywordPopularityChart(
  keyword: string,
  weeks: number
): Promise<ChartPoint[]> {
  const keywordTrend = await getKeywordTrend({ keyword, weeks });
  console.log(keywordTrend);
  // @ts-ignore
  return keywordTrend.data.map((timelineData) => ({
    ...timelineData,
    date: new Date(timelineData.timestamp * 1000),
  }));
}

export function decodeCachedChartPoints(points: ChartPoint[]): ChartPoint[] {
  return points.map((point) => ({
    ...point,
    date: new Date(point.date),
  }));
}
