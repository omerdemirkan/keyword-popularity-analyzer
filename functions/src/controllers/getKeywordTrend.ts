import { fetchKeywordTrendFromDatabase } from "../utils/services";
import { Controller, KeywordPopularity } from "../utils/types";

export interface GetTrendsData {
  keyword: string;
  weeks: number;
}

export const getKeywordTrend: Controller<
  GetTrendsData,
  Promise<KeywordPopularity[]>
> = async function ({ keyword, weeks }) {
  if (typeof keyword !== "string") throw new Error("keyword query expected.");
  const keywordTrend = await fetchKeywordTrendFromDatabase(keyword);
  return keywordTrend.slice(keywordTrend.length - weeks);
};
