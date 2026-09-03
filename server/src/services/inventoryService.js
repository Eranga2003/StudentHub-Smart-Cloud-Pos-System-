import { getCollection, COLLECTIONS } from '../config/database.js';

export const inventoryService = {
  async getInventoryList() {
    // Architecture ready for Firestore query on inventoryTransactions and products
    return [];
  },
};

export default inventoryService;
