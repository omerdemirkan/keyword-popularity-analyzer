import sub from "date-fns/sub";
import { ALERT_KEYWORDS, MIN_ALERT_WEEK_LOW } from "../constants";
import db from "../db";
import { auditKeyword } from "../services";
import { sendAlerts } from "../services/alert.services";
import { Job, KeywordAudit } from "../types";

// job that runs weekly that checks for declining popularity
// in crypto and conditionally sends alerts to users.
export const sendWeeklyAlerts: Job = async function (context) {
  try {
    const promises = ALERT_KEYWORDS.map((keyword) => auditKeyword(keyword));
    const keywordAudits = await Promise.all(promises);
    const alertAudits: KeywordAudit[] = [];

    for (const audit of keywordAudits) {
      if (audit.nWeekLow < MIN_ALERT_WEEK_LOW) continue;

      // Avoid sending alert if an alert for the same keyword
      // and in the same week bracket was sent in the past month
      const startDate = sub(new Date(), { weeks: 4 });
      const isDuplicateAlert =
        (
          await db
            .collection("alerts")
            .where("keyword", "==", audit.keyword)
            .where("createdAt", ">", startDate)
            .where("nWeekLow", ">=", audit.nWeekLow - 6)
            .get()
        ).size > 0;

      if (isDuplicateAlert) continue;

      alertAudits.push(audit);
    }
    await sendAlerts(alertAudits);
  } catch (error) {
    //
  }
};
