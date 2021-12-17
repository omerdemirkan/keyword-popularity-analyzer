import * as functions from "firebase-functions";

// This is a function since I want changes
// in firebase config variables to go into
// effect immediately.

export const config = () =>
  Object.freeze({
    sendGrid: {
      apiKey: functions.config().sendgrid.api_key as string,
      templatesIds: {
        welcomeEmail: functions.config().sendgrid.templates
          .welcome_email as string,
        nWeekLowEmail: functions.config().sendgrid.templates
          .n_week_low_email as string,
      },
      maxEmailsPerRequest: 1000,
    },
    client: {
      unsubscribeUrl: functions.config().client.unsubscribe_url as string,
      reportBugUrl: functions.config().client.report_bug_url as string,
    },
  });
