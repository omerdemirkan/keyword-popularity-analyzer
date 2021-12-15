import { fetchKeywordTrend } from "../services";
import { Controller, KeywordPopularity } from "../types";

export interface GetTrendsData {
  keyword: string;
  weeks: number;
}

export const getKeywordTrend: Controller<
  GetTrendsData,
  Promise<KeywordPopularity[]>
> = async function ({ keyword, weeks }) {
  if (typeof keyword !== "string") throw new Error("keyword query expected.");
  return await fetchKeywordTrend(keyword, { weeks });
};
