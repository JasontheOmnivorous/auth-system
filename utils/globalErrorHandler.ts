import { NextFunction, Request, Response } from "express";
import AppError from "./appError";

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "";
  const status = err.status || "fail";

  res.status(statusCode).json({
    status,
    message,
  });
};
