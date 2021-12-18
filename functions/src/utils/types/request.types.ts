import { CallableContext } from "firebase-functions/lib/providers/https";

export type Controller<Data, ReturnValue> = (
  data: Data,
  response?: CallableContext
) => ReturnValue;
