import crypto from "crypto";
import dotenv from "dotenv";
import { CookieOptions, NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, UserType } from "../model/userModel";
import { ExtendedRequest } from "../types/auth";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { sendEmail } from "../utils/email";
dotenv.config({ path: "./../.env" });

const generateToken = (id: string) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET || "", {
    expiresIn: process.env.JWT_EXPIRE || "",
  });
};

const sendToken = (
  user: UserType,
  statusCode: number,
  res: Response,
  next: NextFunction
) => {
  const token = generateToken(user.id);

  if (!token)
    return next(
      new AppError(
        "Fail to generate token. Your id probably is not working.",
        401
      )
    );

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
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

    sendToken(newUser, 201, res, next);
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

    sendToken(user, 200, res, next);
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

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    const constructedMessage = `Forgot your password? Send a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, simply ignore this message.`;

    try {
      await sendEmail({
        email,
        subject: "Reset password token",
        textMessage: constructedMessage,
      });

      res.status(200).json({
        status: "success",
        message: "Email sent successfully!",
      });
    } catch (err) {
      dbUser.passwordResetToken = undefined;
      dbUser.passwordResetTokenExpiration = undefined;
      dbUser.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending email. Please try again later.",
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const dbUser = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiration: { $gt: Date.now() },
    });

    if (!dbUser)
      return next(
        new AppError(
          "Your token is either expired or invalid. Please try again.",
          400
        )
      );

    dbUser.password = req.body.password;
    dbUser.passwordConfirm = req.body.passwordConfirm;
    dbUser.passwordResetToken = undefined;
    dbUser.passwordResetTokenExpiration = undefined;

    await dbUser.save();

    sendToken(dbUser, 200, res, next);
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

export const updatePassword = catchAsync(
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const dbUser = await User.findById(req?.user?._id).select("+password");

    console.log(req.body);
    console.log("dbUser password: ", dbUser?.password);

    if (!dbUser) return next(new AppError("No user found with that id.", 400));

    const correctPassword = await dbUser.comparePassword(
      req.body.passwordCurrent,
      dbUser.password
    );

    if (!correctPassword)
      return next(new AppError("Wrong password. Try again!", 401));

    dbUser.password = req.body.password;
    dbUser.passwordConfirm = req.body.passwordConfirm;
    dbUser.save();

    sendToken(dbUser, 200, res, next);
  }
);
