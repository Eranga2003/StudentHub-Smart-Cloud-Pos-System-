import { firestore } from './firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Access the centralized Firestore instance.
 * Throws an error if Firestore is not initialized.
 */
export const getDb = () => {
  if (!firestore) {
    throw new Error('Firestore database instance is not initialized. Check Firebase configuration.');
  }
  return firestore;
};

/**
 * Helper to get a Firestore collection reference safely.
 * @param {string} collectionName - Valid collection name from COLLECTIONS constant.
 */
export const getCollection = (collectionName) => {
  return getDb().collection(collectionName);
};

export { COLLECTIONS };
export default {
  getDb,
  getCollection,
  COLLECTIONS,
};
