import { config } from "../config";
import * as sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(config().sendGrid.apiKey);

type MailData = sendGrid.MailDataRequired & {
  type: "info" | "help" | "notification";
};

export async function sendNWeekLowEmails(data: MailData[]): Promise<void> {
  await sendGrid.send(data);
}

export async function sendWelcomeEmail({
  email,
  templateId,
  unsubscribeUrl,
  reportBugUrl,
}: {
  email: string;
  templateId: string;
  unsubscribeUrl: string;
  reportBugUrl: string;
}): Promise<void> {
  await sendGrid.send({
    from: "info@remindmeaboutbitcoin.com",
    to: email,
    templateId,
    dynamicTemplateData: {
      unsubscribeUrl,
      reportBugUrl,
      subject: "You're subscribed!",
    },
  });
}
