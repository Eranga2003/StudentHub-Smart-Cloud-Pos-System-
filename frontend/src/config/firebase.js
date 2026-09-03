/**
 * Student Hub POS - Official Firebase & Firestore Configuration
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyD1Frth3qU1GScyy2_NDUXtWUCLhEHeNHM",
  authDomain: "student-hub-smart-pos-system.firebaseapp.com",
  projectId: "student-hub-smart-pos-system",
  storageBucket: "student-hub-smart-pos-system.firebasestorage.app",
  messagingSenderId: "421886562569",
  appId: "1:421886562569:web:b02ccb4385165dbcc003d8",
  measurementId: "G-XS4B1NG7DR"
};

// Initialize Firebase client
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default {
  app,
  db,
  firebaseConfig,
};
