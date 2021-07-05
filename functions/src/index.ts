import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sendGrid from "@sendgrid/mail";

admin.initializeApp();
// const db = admin.firestore();
const config = {
  sendGrid: {
    apiKey: functions.config().sendgrid.api_key,
    templatesIds: {
      keywordPing: functions.config().sendgrid.templates.keyword_ping,
    },
  },
};
sendGrid.setApiKey(config.sendGrid.apiKey);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const sendMail = functions.https.onRequest(async function (req, res) {
  try {
    if (!req.query.to) throw new Error("email destination wasn't sent.");
    await sendGrid.send({
      to: req.query.to as string,
      from: "ping@remindmeaboutbitcoin.com",
      templateId: config.sendGrid.templatesIds.keywordPing,
      dynamicTemplateData: {
        title: "Ayy you got mail g",
        description: "Whats good",
      },
    });
    res.send(`An email was sent to ${req.query.to}`);
  } catch (error) {
    res.send(`An error occured: <br> <pre>${JSON.stringify(error)}</pre>`);
  }
});
