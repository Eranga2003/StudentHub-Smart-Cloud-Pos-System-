import env from '../config/environment.js';
import { sendError } from '../utils/apiResponse.js';
import { AppError } from '../errors/AppError.js';

/**
 * Centralized Error Handling Middleware
 * Formats all operational and internal errors into a standardized JSON response.
 */
export const errorMiddleware = (err, req, res, next) => {
  // If response headers have already been sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError;
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Log non-operational or 500 errors
  if (!isAppError || statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Hide internal server error details in production
  let message = err.message || 'Something went wrong';
  let details = err.details || null;

  if (statusCode === 500 && env.isProduction) {
    message = 'Something went wrong';
    details = null;
  } else if (statusCode === 500 && env.isDevelopment) {
    // In development mode, provide stack for easy debugging
    details = {
      stack: err.stack,
      ...(err.details || {}),
    };
  }

  return sendError(res, message, errorCode, statusCode, details);
};

export default errorMiddleware;
