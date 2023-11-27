import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
dotenv.config({ path: "./../.env" });

const generateToken = (id: string) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET || "", {
    expiresIn: process.env.JWT_EXPIRE || "",
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    const token = generateToken(String(newUser._id));

    if (!token) return next(new AppError("Fail to generate token.", 404));

    res.status(201).json({
      status: "success",
      token,
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError("Please provide both email and password.", 404));

    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !user.comparePassword(password, user.password))
      return next(new AppError("Incorrect email or password.", 404));

    const token = generateToken(String(user._id));

    res.status(200).json({
      status: "success",
      token,
    });
  }
);
