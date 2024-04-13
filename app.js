// IMPORT PACKAGE
import express from "express";
import cors from "cors";

// IMPORT ROUTE
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";

// IMPORT COTROLLER AND HANDLER
import globalErrorHandler from "./controller/errorController.js";
import CustomError from "./utils/customErrorHandler.js";

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// USE ROUTE
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);

app.all("*", (req, res, next) => {
  const err = new CustomError(
    "The resource requested could not be found on the server",
    404
  );
  next(err);
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
