import { sendError } from '../utils/apiResponse.js';

/**
 * 404 Not Found Middleware
 * Handles requests to endpoints that do not exist.
 */
export const notFoundMiddleware = (req, res) => {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    'NOT_FOUND',
    404
  );
};

export default notFoundMiddleware;
