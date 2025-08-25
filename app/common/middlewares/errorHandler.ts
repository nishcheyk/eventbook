import { ErrorRequestHandler } from "express";

/**
 * Centralized error handling middleware.
 * Returns JSON with status code and error message.
 */
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    status,
    message,
  });
};

export default errorHandler;
