import { purchaseService } from '../services/purchaseService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const purchaseController = {
  async getPurchases(req, res, next) {
    try {
      const purchases = await purchaseService.getAllPurchases();
      return sendSuccess(res, 'Purchases API is ready', purchases);
    } catch (error) {
      return next(error);
    }
  },
};

export default purchaseController;
