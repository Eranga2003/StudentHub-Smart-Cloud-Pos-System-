import { supplierService } from '../services/supplierService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const supplierController = {
  async getSuppliers(req, res, next) {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      return sendSuccess(res, 'Suppliers API is ready', suppliers);
    } catch (error) {
      return next(error);
    }
  },
};

export default supplierController;
