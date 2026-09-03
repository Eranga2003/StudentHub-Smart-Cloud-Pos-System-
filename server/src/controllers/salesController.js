import { salesService } from '../services/salesService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const salesController = {
  async getSales(req, res, next) {
    try {
      const sales = await salesService.getAllSales();
      return sendSuccess(res, 'Sales API is ready', sales);
    } catch (error) {
      return next(error);
    }
  },
};

export default salesController;
