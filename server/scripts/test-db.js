import env from '../src/config/environment.js';
import { testFirestoreConnection, firebaseConfig } from '../src/config/firebase.js';

async function runTest() {
  console.log('==================================================');
  console.log(' Student Hub POS — Database Connection Test');
  console.log('==================================================');
  console.log(` Project ID:     ${firebaseConfig.projectId}`);
  console.log(` Auth Domain:    ${firebaseConfig.authDomain}`);
  console.log(` Storage Bucket: ${firebaseConfig.storageBucket}`);
  console.log(' Testing live connection to Firestore...');

  const startTime = Date.now();
  try {
    const result = await testFirestoreConnection();
    const duration = Date.now() - startTime;

    console.log('--------------------------------------------------');
    console.log(` Result:         ${result.message}`);
    console.log(` Response Time:  ${duration} ms`);
    console.log(' Status:         CONNECTED (Ready for POS transactions)');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('--------------------------------------------------');
    console.error(' Connection Failed:', error.message);
    console.log('==================================================');
    process.exit(1);
  }
}

runTest();
