import { fetchKeywordPopularity, nWeekLow } from "../services";
import { Controller } from "../types";

export const getNWeekLow: Controller = async function (req, res) {
  const keyword = req.query.keyword;
  try {
    if (typeof keyword !== "string") throw new Error("keyword query required.");
    const popularityTimeline = await fetchKeywordPopularity(keyword);
    const result = nWeekLow(popularityTimeline);
    res.send(`"${keyword}" is searched at a ${result} week low.`);
  } catch (error) {
    res.send(`An error occured:\n<pre>${JSON.stringify(error, null, 2)}</pre>`);
  }
};
