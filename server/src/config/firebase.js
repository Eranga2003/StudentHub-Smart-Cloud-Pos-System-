import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import env from './environment.js';

let firebaseApp = null;
let firestore = null;
let auth = null;
let storage = null;

try {
  if (!admin.apps.length) {
    let credential = null;

    // 1. Check if service account key file path is provided
    if (env.firebase.serviceAccountKeyPath) {
      const resolvedPath = path.resolve(env.firebase.serviceAccountKeyPath);
      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
      }
    }

    // 2. Check if direct environment variables are provided
    if (!credential && env.firebase.clientEmail && env.firebase.privateKey) {
      credential = admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      });
    }

    // 3. Fallback for environments with application default credentials or mock mode
    if (!credential) {
      if (env.firebase.projectId) {
        try {
          credential = admin.credential.applicationDefault();
        } catch {
          // If application default is not configured, initialize with project ID for local dev
          credential = null;
        }
      }
    }

    const appOptions = {};
    if (credential) {
      appOptions.credential = credential;
    }
    if (env.firebase.projectId) {
      appOptions.projectId = env.firebase.projectId;
    }
    if (env.firebase.storageBucket) {
      appOptions.storageBucket = env.firebase.storageBucket;
    }

    if (credential || env.firebase.projectId) {
      firebaseApp = admin.initializeApp(appOptions);
    } else {
      console.warn(
        '[Firebase] Warning: No Firebase credentials found. Running in offline/uninitialized mode.'
      );
    }
  } else {
    firebaseApp = admin.app();
  }

  if (firebaseApp) {
    firestore = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error.message);
}

export { firebaseApp, firestore, auth, storage };
export const db = firestore;
export default {
  firebaseApp,
  firestore,
  db: firestore,
  auth,
  storage,
};
