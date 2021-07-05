import { config } from "../config";
import * as sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(config.sendGrid.apiKey);

type MailData = sendGrid.MailDataRequired & {
  type: "info" | "help" | "notification";
};

export async function sendEmail(data: MailData | MailData[]) {
  return await sendGrid.send(data);
}
