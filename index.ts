import express from "express";
import userRouter from "./route/userRoute";
import { globalErrorHandler } from "./utils/globalErrorHandler";
const app = express();

app.use(userRouter);
app.use(globalErrorHandler);

export default app;
