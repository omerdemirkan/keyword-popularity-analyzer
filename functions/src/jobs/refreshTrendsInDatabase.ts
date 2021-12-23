import { ALERT_KEYWORDS } from "../utils/constants";
import { refreshKeywordTrendInDatabase } from "../utils/services";
import { Job } from "../utils/types";

export const refreshTrendsInDatabase: Job = async function () {
  await Promise.all(
    ALERT_KEYWORDS.map((keyword) => refreshKeywordTrendInDatabase(keyword))
  );
};
