import { serviceItemService } from '../services/serviceItemService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const serviceController = {
  async getServices(req, res, next) {
    try {
      const services = await serviceItemService.getAllServices();
      return sendSuccess(res, 'Services API is ready', services);
    } catch (error) {
      return next(error);
    }
  },
};

export default serviceController;
