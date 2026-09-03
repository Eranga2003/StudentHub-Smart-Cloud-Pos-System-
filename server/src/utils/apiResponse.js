/**
 * Standard API Success Response
 * @param {import('express').Response} res
 * @param {string} message - Human-readable success message
 * @param {any} [data={}] - Response payload
 * @param {number} [statusCode=200] - HTTP status code
 */
export const sendSuccess = (res, message = 'Operation successful', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard API Error Response
 * @param {import('express').Response} res
 * @param {string} message - Human-readable error message
 * @param {string} errorCode - Machine-readable error code (e.g. 'UNAUTHORIZED')
 * @param {number} [statusCode=500] - HTTP status code
 * @param {any} [details=null] - Optional additional details (only included if provided)
 */
export const sendError = (
  res,
  message = 'Operation failed',
  errorCode = 'INTERNAL_SERVER_ERROR',
  statusCode = 500,
  details = null
) => {
  const response = {
    success: false,
    message,
    error: {
      code: errorCode,
      ...(details ? { details } : {}),
    },
  };

  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError,
};
