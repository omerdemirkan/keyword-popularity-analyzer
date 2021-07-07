import sub from "date-fns/sub";
import { ALERT_KEYWORDS, ALERT_WEEK_BREAKPOINTS } from "../constants";
import db from "../db";
import { auditKeyword } from "../services";
import { sendAlerts } from "../services/alert.services";
import { Job, KeywordAudit } from "../types";

// job that runs weekly that checks for declining popularity
// in crypto and conditionally sends alerts to users.
export const sendWeeklyAlerts: Job = async function (context) {
  try {
    const maxWeeks = Math.max(...ALERT_WEEK_BREAKPOINTS) + 1;
    const promises = ALERT_KEYWORDS.map((keyword) =>
      auditKeyword(keyword, maxWeeks)
    );
    const keywordAudits = await Promise.all(promises);
    const alertAudits: KeywordAudit[] = [];

    for (const audit of keywordAudits) {
      // Keyword's popularity has to be at a downward
      // trend for a sufficient amount of time.
      // Bear minimum, nWeekLow has to surpass the
      // minimum alert week breakpoint.
      if (!audit.breakpointWeeks) continue;

      const startDate = sub(new Date(), { weeks: audit.breakpointWeeks });
      const isDuplicateAlert =
        (
          await db
            .collection("alerts")
            .where("keyword", "==", audit.keyword)
            .where("createdAt", ">", startDate)
            .get()
        ).size > 0;

      // Keyword must not cause two alerts in between the same
      // two breakpoints. For instance, the same keyword shouldn't
      // send two seperate alerts for nWeekLow=22 and nWeekLow=23
      if (isDuplicateAlert) continue;

      alertAudits.push(audit);
    }
    await sendAlerts(alertAudits);
  } catch (error) {
    //
  }
};
