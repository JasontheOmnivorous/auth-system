import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import userRouter from "./route/userRoute";
import AppError from "./utils/appError";
import { globalErrorHandler } from "./utils/globalErrorHandler";
const app = express();

app.use(morgan("dev"));
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
