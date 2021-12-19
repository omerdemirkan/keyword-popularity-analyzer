import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { ChartPoint, KeywordPopularity } from "../types";

const getKeywordTrend = httpsCallable<
  { keyword: string; weeks: number },
  KeywordPopularity[]
>(functions, "getKeywordTrend");

export async function fetchKeywordPopularityChart(
  keyword: string,
  weeks: number
): Promise<KeywordPopularity[]> {
  const { data: keywordTrend } = await getKeywordTrend({
    keyword,
    weeks,
  });
  return keywordTrend.map((timelineData) => ({
    ...timelineData,
    date: new Date(timelineData.timestamp * 1000),
  }));
}

export function decodeCachedChartPoints<T extends ChartPoint>(
  points: T[]
): T[] {
  return points.map((point) => ({
    ...point,
    date: new Date(point.date),
  }));
}
