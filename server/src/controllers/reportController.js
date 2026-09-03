import { reportService } from '../services/reportService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const reportController = {
  async getReports(req, res, next) {
    try {
      const summary = await reportService.getSummaryReport();
      return sendSuccess(res, 'Reports API is ready', summary);
    } catch (error) {
      return next(error);
    }
  },
};

export default reportController;
