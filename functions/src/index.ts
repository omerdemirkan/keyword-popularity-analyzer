import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as controllers from "./controllers";
import * as jobs from "./jobs";

admin.initializeApp();
// const db = admin.firestore();

// Endpoints
export const getTrends = functions.https.onRequest(controllers.getTrends);
export const getNWeekLow = functions.https.onRequest(controllers.getNWeekLow);

// Jobs
export const sendAlerts = functions.pubsub
  .schedule("0 12 * * 0")
  .onRun(jobs.sendWeeklyAlerts);
