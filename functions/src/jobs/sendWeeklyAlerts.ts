import { config } from "../config";
import { ALERT_KEYWORDS, MIN_ALERT_WEEK_LOW } from "../utils/constants";
import db from "../db";
import {
  fetchKeywordTrendFromDatabase,
  sendNWeekLowEmails,
} from "../utils/services";
import { Job } from "../utils/types";

// job that runs weekly that checks for declining popularity
// in crypto and conditionally sends alerts to users.
export const sendWeeklyAlerts: Job = async function () {
  try {
    const promises = ALERT_KEYWORDS.map((keyword) =>
      fetchKeywordTrendFromDatabase(keyword)
    );
    const keywordTrends = await Promise.all(promises);

    const keywordNWeekLow: { [keyword: string]: number } = {};
    ALERT_KEYWORDS.forEach(function (keyword, i) {
      const trend = keywordTrends[i];
      const nWeekLow = trend[trend.length - 1].nWeekLow;
      keywordNWeekLow[keyword] = nWeekLow;
    });

    const noteworthyKeywords = ALERT_KEYWORDS.filter(
      (keyword) => keywordNWeekLow[keyword] >= MIN_ALERT_WEEK_LOW
    ).sort((a, b) => keywordNWeekLow[a] - keywordNWeekLow[b]);

    if (!noteworthyKeywords.length) return;

    // TODO add additional noteworthy trends to emails
    const keyword = noteworthyKeywords[0];
    const nWeekLow = keywordNWeekLow[keyword];

    const emailsRef = await db.collection("subscriptions").get();
    const emails = emailsRef.docs.map((doc) => doc.get("email"));

    const cf = config();

    await sendNWeekLowEmails({
      emails,
      keyword,
      nWeekLow,
      reportBugUrl: cf.client.reportBugUrl,
      buildUnsubscribeUrl: (email) =>
        `${cf.client.unsubscribeUrl}?email=${email}`,
    });
  } catch (error) {
    console.log(error);
  }
};
