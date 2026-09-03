import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const authController = {
  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.uid);
      return sendSuccess(res, 'Profile retrieved successfully', {
        user: req.user,
        profile,
      });
    } catch (error) {
      return next(error);
    }
  },
};

export default authController;
