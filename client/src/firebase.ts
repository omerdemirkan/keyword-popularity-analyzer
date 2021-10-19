import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

const app = initializeApp({
  //   apiKey: "### FIREBASE API KEY ###",
  //   authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "social-ping-b6c71",
  //   databaseURL: "https://### YOUR DATABASE NAME ###.firebaseio.com",
});
export const functions = getFunctions(app);
