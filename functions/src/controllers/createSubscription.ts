import db from "../db";
import { Controller } from "../types";

export const createSubscription: Controller<{ email: string }, void> = async ({
  email,
}) => {
  await db.collection("subscriptions").doc(email).set({ email });
};
