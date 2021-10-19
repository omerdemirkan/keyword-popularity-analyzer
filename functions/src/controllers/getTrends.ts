import { auditKeyword } from "../services";
import { Controller, KeywordAudit } from "../types";

export const getTrends: Controller<
  { keyword: string; weeks: number },
  Promise<KeywordAudit>
> = async function (data, context) {
  const keyword = data.keyword;
  const weeks = data.weeks && +data.weeks ? +data.weeks : 104;
  if (typeof keyword !== "string") throw new Error("keyword query expected.");
  const results = await auditKeyword(keyword, weeks);
  return results;
};
