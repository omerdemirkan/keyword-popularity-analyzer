import * as functions from "firebase-functions";
import * as controllers from "./controllers";
// import * as jobs from "./jobs";

// Endpoints
export const getKeywordTrend = functions.https.onCall(
  controllers.getKeywordTrend
);
export const createSubscription = functions.https.onCall(
  controllers.createSubscription
);
export const deleteSubscription = functions.https.onCall(
  controllers.deleteSubscription
);

// Jobs
// export const sendAlerts = functions.pubsub
//   .schedule("0 12 * * 0")
//   .onRun(jobs.sendWeeklyAlerts);
