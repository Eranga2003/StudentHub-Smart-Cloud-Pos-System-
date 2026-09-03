import { getCollection, COLLECTIONS } from '../config/database.js';
import { ITEM_TYPES } from '../constants/itemTypes.js';

export const serviceItemService = {
  async getAllServices() {
    // Architecture ready for Firestore query on services collection
    // Items will have type: ITEM_TYPES.SERVICE (non-stock student services)
    return [];
  },
};

export default serviceItemService;
