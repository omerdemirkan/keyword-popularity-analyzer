import db from "../db";
import { validateEmail } from "../helpers";
import { Controller } from "../types";

export const createSubscription: Controller<{ email: string }, void> = async ({
  email,
}) => {
  email = email.toLowerCase();
  if (!validateEmail(email)) return;
  await db.collection("subscriptions").doc(email).set({ email });
};
