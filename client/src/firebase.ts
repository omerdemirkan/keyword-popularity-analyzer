import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { __DEV__ } from "./config";

const app = initializeApp({
  //   apiKey: "### FIREBASE API KEY ###",
  //   authDomain: "### FIREBASE AUTH DOMAIN ###",
  projectId: "social-ping-b6c71",
  //   databaseURL: "https://### YOUR DATABASE NAME ###.firebaseio.com",
});

export const functions = getFunctions(app);

if (__DEV__) connectFunctionsEmulator(functions, "localhost", 5000);
