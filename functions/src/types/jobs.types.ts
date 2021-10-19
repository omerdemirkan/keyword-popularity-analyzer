import { EventContext } from "firebase-functions";

export type Job = (context: EventContext) => void;
