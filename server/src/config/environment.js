import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyD1Frth3qU1GScyy2_NDUXtWUCLhEHeNHM',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'student-hub-smart-pos-system.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'student-hub-smart-pos-system',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'student-hub-smart-pos-system.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '421886562569',
    appId: process.env.FIREBASE_APP_ID || '1:421886562569:web:b02ccb4385165dbcc003d8',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-XS4B1NG7DR',

    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || '',
  },

  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export default env;
