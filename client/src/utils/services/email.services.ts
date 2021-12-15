import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";

export const sendWelcomeEmail = httpsCallable<string, void>(
  functions,
  "sendWelcomeEmail"
);
