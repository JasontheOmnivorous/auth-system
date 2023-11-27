import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: "./.env" });

interface UnhandledErr {
  name: string;
  message: string;
  stack?: string;
}

process.on("uncaughtException", (err: UnhandledErr) => {
  console.log("Unhandled exception found! Shutting down the application...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./index";

mongoose
  .connect(process.env.DB || "")
  .then(() => console.log("DB connected successfully!"));

const port = process.env.PORT || "";
const server = app.listen(port, () =>
  console.log(`Server listening at port ${port}...`)
);

process.on("unhandledRejection", (err: UnhandledErr) => {
  console.log("Uncaught exception found! Shutting down the application...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
