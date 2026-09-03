import { notificationService } from '../services/notificationService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getAllNotifications();
      return sendSuccess(res, 'Notifications API is ready', notifications);
    } catch (error) {
      return next(error);
    }
  },
};

export default notificationController;
