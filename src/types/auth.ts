import { NextFunction, Request, Response } from "express";

export type ReqHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface ExtendedRequest extends Request {
  user?: {
    role: string;
  };
}
