import * as functions from "firebase-functions";

export const config = {
  sendGrid: {
    apiKey: functions.config().sendgrid.api_key,
    templatesIds: {
      keywordPing: functions.config().sendgrid.templates.keyword_ping,
    },
  },
};
