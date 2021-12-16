import { config } from "../config";
import * as sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(config().sendGrid.apiKey);

export interface SendNWeekLowOptions {
  emails: string[];
  keyword: string;
  nWeekLow: number;
  reportBugUrl: string;
  buildUnsubscribeUrl(email: string): string;
}

export async function sendNWeekLowEmails({
  emails,
  keyword,
  nWeekLow,
  reportBugUrl,
  buildUnsubscribeUrl,
}: SendNWeekLowOptions): Promise<void> {
  const maxEmailsPerRequest = config().sendGrid.maxEmailsPerRequest;
  const promises: Promise<unknown>[] = [];
  let requestEmails: string[] = [];
  const templateId = config().sendGrid.templatesIds.nWeekLowEmail;

  emails.forEach(function (email, index) {
    requestEmails.push(email);
    if (
      requestEmails.length === maxEmailsPerRequest ||
      index === emails.length - 1
    ) {
      promises.push(
        sendGrid.send({
          from: "Crypto Alerts <info@remindmeaboutbitcoin.com>",
          templateId,
          dynamicTemplateData: {
            keyword,
            nWeekLow,
            reportBugUrl,
            subject: "Crypto popularity is down!",
          },
          personalizations: requestEmails.map((email) => ({
            to: email,
            dynamicTemplateData: {
              unsubscribeUrl: buildUnsubscribeUrl(email),
            },
          })),
        })
      );
      requestEmails = [];
    }
  });
  await Promise.all(promises);
}

export interface SendWelcomeEmail {
  email: string;
  templateId: string;
  unsubscribeUrl: string;
  reportBugUrl: string;
}

export async function sendWelcomeEmail({
  email,
  templateId,
  unsubscribeUrl,
  reportBugUrl,
}: SendWelcomeEmail): Promise<void> {
  await sendGrid.send({
    from: "Crypto Alerts <info@remindmeaboutbitcoin.com>",
    to: email,
    templateId,
    dynamicTemplateData: {
      unsubscribeUrl,
      reportBugUrl,
      subject: "You're subscribed!",
    },
  });
}
