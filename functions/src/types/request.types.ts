import { Request, Response } from "firebase-functions";

export type Controller = (
  request: Request,
  response: Response
) => void | Promise<void>;
