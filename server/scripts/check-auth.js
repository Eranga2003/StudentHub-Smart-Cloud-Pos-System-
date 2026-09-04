import { getFirestore, doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyD1Frth3qU1GScyy2_NDUXtWUCLhEHeNHM",
  authDomain: "student-hub-smart-pos-system.firebaseapp.com",
  projectId: "student-hub-smart-pos-system",
  storageBucket: "student-hub-smart-pos-system.firebasestorage.app",
  messagingSenderId: "421886562569",
  appId: "1:421886562569:web:b02ccb4385165dbcc003d8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAuth() {
  console.log('--- Checking Firestore system_users collection ---');
  const userRef = doc(db, 'system_users', 'dinesh_admin');
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    console.log('User Document in Firestore:');
    console.log('  Email:           ', data.email);
    console.log('  Password:        ', data.password);
    console.log('  Name:            ', data.name);
    console.log('  Role:            ', data.role);
    console.log('  Status:          ', data.status);
    console.log('  Last Login:      ', data.lastLoginAt);
    console.log('  Sri Lanka Time:  ', data.lastLoginSriLankaTime);
    console.log('  Active Token:    ', data.activeToken ? data.activeToken.slice(0, 35) + '...' : 'none');
    console.log('  Token Expires At:', data.activeTokenExpiresAt ? new Date(data.activeTokenExpiresAt).toISOString() : 'none');
  } else {
    console.log('dinesh_admin not found in Firestore yet');
  }

  console.log('\n--- Checking auth_sessions collection ---');
  const sessionSnap = await getDocs(query(collection(db, 'auth_sessions'), limit(3)));
  console.log(`Found ${sessionSnap.size} session entries in Firestore`);
  sessionSnap.forEach((d) => {
    const s = d.data();
    console.log(`- Session [${d.id}]: user=${s.userEmail}, date=${s.date}, token=${s.token ? s.token.slice(0, 20) + '...' : ''}`);
  });

  process.exit(0);
}

checkAuth().catch(err => {
  console.error(err);
  process.exit(1);
});
