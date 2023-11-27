import { NextFunction, Request, Response } from "express";
import { User } from "../model/userModel";
import { catchAsync } from "../utils/catchAsync";
import AppError from "./../utils/appError";

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = User.find();

    res.status(200).json({
      status: "success",
      data: users,
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = User.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);

export const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validate = {
      name: req.body.name,
      email: req.body.name,
      photo: req.body.photo ? req.body.photo : "",
      password: req.body.name,
      passwordConfirm: req.body.passwordConfirm,
    };
    const user = User.create(validate);

    res.status(201).json({
      status: "success",
      data: user,
    });
  }
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = User.findByIdAndUpdate(req.params.id, req.body, {
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
