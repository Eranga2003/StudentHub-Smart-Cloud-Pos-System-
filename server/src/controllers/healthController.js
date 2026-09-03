import env from '../config/environment.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const healthController = {
  checkHealth(req, res) {
    return sendSuccess(res, 'Student Hub POS API is running', {
      environment: env.NODE_ENV,
    });
  },
};

export default healthController;
