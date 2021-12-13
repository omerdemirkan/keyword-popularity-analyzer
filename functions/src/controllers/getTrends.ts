import { auditKeyword } from "../services";
import { Controller, KeywordAudit } from "../types";

export interface GetTrendsData {
  keyword: string;
  weeks: number;
}

export const getTrends: Controller<
  GetTrendsData,
  Promise<KeywordAudit>
> = async function ({ keyword, weeks }) {
  if (typeof keyword !== "string") throw new Error("keyword query expected.");
  const results = await auditKeyword(keyword, weeks);
  return results;
};
