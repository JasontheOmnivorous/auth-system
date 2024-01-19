import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../model/userModel";
import { ExtendedRequest } from "../types/auth";
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
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });
    const token = generateToken(String(newUser._id));

    if (!token) return next(new AppError("Fail to generate token.", 401));

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
      return next(new AppError("Incorrect email or password.", 401));

    const token = generateToken(String(user._id));

    res.status(200).json({
      status: "success",
      token,
    });
  }
);

export const protect = catchAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split(" ")[1];

    if (!token) return next(new AppError("You are not logged in!", 401));

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // check if the user still exists after creating the token
    const freshUser = await User.findById(decoded.id);

    if (!freshUser)
      return next(
        new AppError(
          "The user belonging to this token is no longer exists.",
          401
        )
      );

    if (freshUser.passwordChangedAfter(decoded.iat as number)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401
        )
      );
    }

    req.user = freshUser;
    next();
  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) return next(new AppError("Please provide your email.", 400));

    const dbUser = await User.findOne({ email });

    if (!dbUser)
      return next(new AppError("No user found with this email.", 404));

    const resetToken = dbUser.generatePasswordResetToken();

    await dbUser.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      resetToken,
    });
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user)
      return next(
        new AppError(
          "Your token is not authentic! Please try to login again.",
          401
        )
      );

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  };
};
