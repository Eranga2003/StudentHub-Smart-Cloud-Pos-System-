import { productService } from '../services/productService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const productController = {
  async getProducts(req, res, next) {
    try {
      const products = await productService.getAllProducts();
      return sendSuccess(res, 'Products API is ready', products);
    } catch (error) {
      return next(error);
    }
  },
};

export default productController;
