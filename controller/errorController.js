import CustomError from "../utils/customErrorHandler.js";

const devError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const prodError = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

const handleValidationError = (err) => {
  return new CustomError(err.errors[0].message, 400);
};

const handleConstraintError = (err) => {
  return new CustomError(err.errors[0].message, 400);
};

const handleExpiredJWT = (err) => {
  return new CustomError("Token has expired. Please login again!", 401);
};

const handleJWTError = (err) => {
  return new CustomError("Invalid token! Please login again!", 401);
};

const handleNotBefore = (err) => {
  return new CustomError(
    "The token has not been activated yet. Please login!",
    401
  );
};

const handleMulterError = (err) => {
  return new CustomError(err.message, 413);
};

const handleDatabaseError = (err) => {
  if (err.parent.file === "uuid.c") {
    return new CustomError("Car with that ID cannot be found!", 404);
  }
  if (err.parent.file === "enum.c") {
    const match = err.parent.sql.match(/'([^']*)'/);
    const extractedString = match ? match[1] : null;
    return new CustomError(
      `invalid input value for category: '${extractedString}'`,
      400
    );
  }
};

const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "SequelizeDatabaseError")
      error = handleDatabaseError(error);
    if (error.name === "SequelizeValidationError")
      error = handleValidationError(error);
    if (error.name === "SequelizeUniqueConstraintError")
      error = handleConstraintError(error);
    if (error.name === "MulterError") error = handleMulterError(error);
    if (error.name === "TokenExpiredError") error = handleExpiredJWT(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "NotBeforeError") error = handleNotBefore(error);

    prodError(res, error);
  }
};

export default globalErrorHandler;
