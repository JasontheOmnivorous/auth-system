import express from "express";
import { Request, Response, NextFunction } from "express";
import userRouter from "./route/userRoute";
import { globalErrorHandler } from "./utils/globalErrorHandler";
const app = express();

app.use(userRouter);
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError("This route is not defined.", 404);
});
app.use(globalErrorHandler);

export default app;
