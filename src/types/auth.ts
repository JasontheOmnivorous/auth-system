import { NextFunction, Request, Response } from "express";
import { UserType } from "../model/userModel";

export type ReqHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface ExtendedRequest extends Request {
  user?: UserType | null;
}
