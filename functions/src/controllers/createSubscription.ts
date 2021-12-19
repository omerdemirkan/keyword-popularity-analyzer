import db from "../db";
import { validateEmail } from "../utils/helpers";
import { Controller } from "../utils/types";

export const createSubscription: Controller<{ email: string }, void> = async ({
  email,
}) => {
  email = email.toLowerCase();
  if (!validateEmail(email)) return;
  await db.collection("subscriptions").doc(email).set({ email });
};
