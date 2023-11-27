import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../model/userModel";
import { ExtendedRequest } from "../types/auth";
import AppError from "./appError";
import { catchAsync } from "./catchAsync";
dotenv.config({ path: "./../.env" });

export const protect = catchAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split(" ")[1];

    if (!token) return next(new AppError("You are not logged in.", 401));

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = await User.findById(decoded.id);
    next();
  }
);
