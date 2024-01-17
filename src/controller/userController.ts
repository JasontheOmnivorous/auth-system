import { NextFunction, Request, Response } from "express";
import { User } from "../model/userModel";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      totalUsers: users.length,
      data: users,
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);

export const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
    });

    if (!newUser) return next(new AppError("Fail to create user.", 400));

    res.status(201).json({
      status: "success",
      data: newUser,
    });
  }
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) return next(new AppError("No users found with that id.", 404));

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return next(new AppError("No users found with that id.", 404));

    res.status(204).json({
      status: "success",
    });
  }
);
