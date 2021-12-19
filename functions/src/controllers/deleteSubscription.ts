import db from "../db";
import { Controller } from "../utils/types";

export const deleteSubscription: Controller<string, void> = async (email) => {
  await db.collection("subscriptions").doc(email).delete();
};
