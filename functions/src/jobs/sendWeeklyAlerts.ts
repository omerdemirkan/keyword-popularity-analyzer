import { ALERT_KEYWORDS } from "../constants";
import { fetchKeywordTrend } from "../services";
import { Job } from "../types";

// job that runs weekly that checks for declining popularity
// in crypto and conditionally sends alerts to users.
export const sendWeeklyAlerts: Job = async function () {
  try {
    const promises = ALERT_KEYWORDS.map((keyword) =>
      fetchKeywordTrend(keyword)
    );
    const keywordTrends = await Promise.all(promises);
    // todo: Send alerts
    console.log(keywordTrends);
  } catch (error) {
    console.log(error);
  }
};
