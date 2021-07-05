import { fetchGoogleTrends } from "../services";
import { Controller } from "../types";

export const getTrends: Controller = async function (req, res) {
  const keyword = req.query.keyword;
  try {
    if (typeof keyword !== "string") throw new Error("keyword query expected.");
    const results = await fetchGoogleTrends({ keyword });
    res.send(
      `Results successfully fetched!\n<pre>${JSON.stringify(
        results,
        null,
        2
      )}</pre>`
    );
  } catch (error) {
    res.send(`An error occured\n<pre>${JSON.stringify(error, null, 2)}</pre>`);
  }
};
