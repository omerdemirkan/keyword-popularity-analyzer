import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as controllers from "./controllers";

admin.initializeApp();
// const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const sendMail = functions.https.onRequest(controllers.sendMail);
