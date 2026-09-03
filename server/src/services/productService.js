import { getCollection, COLLECTIONS } from '../config/database.js';
import { ITEM_TYPES } from '../constants/itemTypes.js';

export const productService = {
  async getAllProducts() {
    // Architecture ready for Firestore query on products collection
    // Items will have type: ITEM_TYPES.PHYSICAL_PRODUCT
    return [];
  },
};

export default productService;
