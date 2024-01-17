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

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      status,
      message: "Invalid token. Please log in again!",
    });
  } else if (err.name === "TokenExpiredError") {
    res.status(401).json({
      status,
      message: "Your token has expired. Please log in again!",
    });
  } else if (err.isOperational) {
    res.status(statusCode).json({
      status,
      message,
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong!",
    });
  }
};
