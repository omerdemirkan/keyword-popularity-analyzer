import { auditKeyword } from "../services";
import { Controller, KeywordAudit } from "../types";

export const getTrends: Controller<
  { keyword: string; weeks: number },
  Promise<KeywordAudit>
> = async function ({ keyword, weeks }) {
  if (typeof keyword !== "string") throw new Error("keyword query expected.");
  const results = await auditKeyword(keyword, weeks);
  return results;
};
