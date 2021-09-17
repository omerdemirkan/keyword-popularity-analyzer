import { auditKeyword } from "../services";
import { Controller } from "../types";

export const getNWeekLow: Controller = async function (req, res) {
  const keyword = req.query.keyword;
  try {
    if (typeof keyword !== "string") throw new Error("keyword query required.");
    const keywordAudit = await auditKeyword(keyword);
    res.send(
      `"${keyword}" is searched at a ${keywordAudit.nWeekLow} week low.`
    );
  } catch (error) {
    res.send(`An error occured:\n<pre>${JSON.stringify(error, null, 2)}</pre>`);
  }
};
