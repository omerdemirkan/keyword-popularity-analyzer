import db from "../db";
import { parseEmail, validateEmail } from "../utils/helpers";
import { Controller } from "../utils/types";

export const createSubscription: Controller<{ email: string }, void> = async ({
  email,
}) => {
  email = parseEmail(email);
  if (!validateEmail(email)) return;
  await db.collection("subscriptions").doc(email).set({ email });
};
