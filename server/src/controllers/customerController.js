import { customerService } from '../services/customerService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const customerController = {
  async getCustomers(req, res, next) {
    try {
      const customers = await customerService.getAllCustomers();
      return sendSuccess(res, 'Customers API is ready', customers);
    } catch (error) {
      return next(error);
    }
  },
};

export default customerController;
