import { ALERT_KEYWORDS, MIN_ALERT_WEEK_LOW } from "../constants";
import { auditKeyword } from "../services";
import { sendAlerts } from "../services/alert.services";
import { Job } from "../types";

// job that runs weekly that checks for declining popularity
// in crypto and conditionally sends alerts to users.
export const sendWeeklyAlerts: Job = async function () {
  try {
    const promises = ALERT_KEYWORDS.map((keyword) => auditKeyword(keyword));
    const keywordAudits = await Promise.all(promises);
    const alertAudits = keywordAudits.filter(
      (audit) => audit.nWeekLow >= MIN_ALERT_WEEK_LOW
    );
    await sendAlerts(alertAudits);
  } catch (error) {
    console.log(error);
  }
};
