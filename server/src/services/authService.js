import { getCollection, COLLECTIONS } from '../config/database.js';

export const authService = {
  async getProfile(uid) {
    // Architecture ready for Firestore query: getCollection(COLLECTIONS.USERS).doc(uid)
    return null;
  },
};

export default authService;
