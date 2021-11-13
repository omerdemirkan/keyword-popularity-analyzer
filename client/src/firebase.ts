import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { __DEV__ } from "./config";

// Initialize Firebase
const app = initializeApp({
  apiKey: "AIzaSyCb3WpvrAtOGhUFtuQ0NLW-eYL3o_vB_Ek",
  authDomain: "social-ping-b6c71.firebaseapp.com",
  projectId: "social-ping-b6c71",
  storageBucket: "social-ping-b6c71.appspot.com",
  messagingSenderId: "140415568508",
  appId: "1:140415568508:web:4265683e6bcb0df2e1d7f9",
  measurementId: "G-ZVNQ8NHRD5",
});

export const functions = getFunctions(app);
export const db = getFirestore(app);

if (__DEV__) connectFunctionsEmulator(functions, "localhost", 5000);
