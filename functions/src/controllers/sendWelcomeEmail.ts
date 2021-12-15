import { Controller } from "../types";
import { sendWelcomeEmail as sendWelcome } from "../services";
import { config } from "../config";

export const sendWelcomeEmail: Controller<string, void> = async function (
  email: string
) {
  const cf = config();
  try {
    await sendWelcome({
      email,
      templateId: cf.sendGrid.templatesIds.welcomeEmail,
      reportBugUrl: cf.client.reportBugUrl,
      unsubscribeUrl: `${cf.client.unsubscribeUrl}?email=${email}`,
    });
  } catch (e) {
    console.log(JSON.stringify(e, null, 2));
  }
};
