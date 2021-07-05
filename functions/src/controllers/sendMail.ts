import { config } from "../config";
import { Controller } from "../types";
import { sendEmail } from "../services/email.services";

export const sendMail: Controller = async (req, res) => {
  try {
    if (!req.query.to) throw new Error("email destination wasn't sent.");
    await sendEmail({
      to: req.query.to as string,
      from: "info@remindmeaboutbitcoin.com",
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
};
