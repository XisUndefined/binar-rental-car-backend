// IMPORT PACKAGE
import express from "express";
import cors from "cors";

// IMPORT ROUTE

// IMPORT COTROLLER AND HANDLER
import globalErrorHandler from "./controller/errorController";
import CustomError from "./utils/customErrorHandler";

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// USE ROUTE

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
