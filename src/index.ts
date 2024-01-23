import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import userRouter from "./route/userRoute";
import AppError from "./utils/appError";
import { globalErrorHandler } from "./utils/globalErrorHandler";
const app = express();

app.use(cors({ origin: "*" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

const rateLimiter = {
  limit: 100,
  windowMilliseconds: Date.now() * 60 * 60 * 1000,
  message:
    "Too much requests from one IP address. Please try again in an hour.",
};

app.use("/api", rateLimit(rateLimiter));

app.use(express.json());
app.get("/", (req: Request, res: Response, next: NextFunction) =>
  res.send(
    "What's up bro! Start using the API by signing in with your account. Check api documentation in my github repository for more details."
  )
);
app.use("/api/v1/users", userRouter);
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError("This route is not defined.", 404));
});
app.use(globalErrorHandler);

export default app;
