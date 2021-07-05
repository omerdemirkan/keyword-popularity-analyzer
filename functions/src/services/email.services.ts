import { config } from "../config";
import * as sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(config.sendGrid.apiKey);

export async function sendEmail(
  data: sendGrid.MailDataRequired | sendGrid.MailDataRequired[]
) {
  await sendGrid.send(data);
}
