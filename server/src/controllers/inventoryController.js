import { inventoryService } from '../services/inventoryService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const inventoryController = {
  async getInventory(req, res, next) {
    try {
      const inventory = await inventoryService.getInventoryList();
      return sendSuccess(res, 'Inventory API is ready', inventory);
    } catch (error) {
      return next(error);
    }
  },
};

export default inventoryController;
