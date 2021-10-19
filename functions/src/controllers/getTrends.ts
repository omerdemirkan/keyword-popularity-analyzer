import { auditKeyword } from "../services";
import { Controller } from "../types";

export const getTrends: Controller = async function (req, res) {
  const keyword = req.query.keyword;
  const weeks = req.query.weeks && +req.query.weeks ? +req.query.weeks : 104;
  try {
    if (typeof keyword !== "string") throw new Error("keyword query expected.");
    const results = await auditKeyword(keyword, weeks);
    res.send(results);
  } catch (error) {
    res.send(`An error occured\n<pre>${JSON.stringify(error, null, 2)}</pre>`);
  }
};
