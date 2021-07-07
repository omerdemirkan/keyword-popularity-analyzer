import { config } from "../config";
import * as sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(config.sendGrid.apiKey);

type MailData = sendGrid.MailDataRequired & {
  type: "info" | "help" | "notification";
};

export async function sendEmail(data: MailData) {
  return await sendGrid.send(data);
}

export async function sendEmails(data: MailData[]) {
  return await sendGrid.send(data);
}
