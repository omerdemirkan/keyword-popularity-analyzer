import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { ChartPoint } from "../types";

const getTrends = httpsCallable(functions, "getTrends");
export async function fetchKeywordPopularityChart(
  keyword: string,
  weeks: number
): Promise<ChartPoint[]> {
  const keywordAudit = await getTrends({ keyword, weeks });
  // @ts-ignore
  return keywordAudit.data.timeline.map((timelineData) => ({
    ...timelineData,
    date: new Date(timelineData.timestamp * 1000),
  }));
}
