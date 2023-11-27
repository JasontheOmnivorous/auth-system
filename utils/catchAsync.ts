import { NextFunction, Request, Response } from "express";
import { ReqHandler } from "../types/auth";

export const catchAsync = (fn: ReqHandler) => {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch((err) => next(err));
};
