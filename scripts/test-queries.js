import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testQuery() {
  try {
    const q = query(
        collection(db, 'poems'), 
        where('status', '==', 'published'), 
        where('published_at', '<', new Date().toISOString()), 
        orderBy('published_at', 'desc'), 
        limit(1)
    );
    const snap = await getDocs(q);
    console.log('Query 1 success. Docs:', snap.size);
  } catch (err) {
    console.error('Query 1 error:', err.message);
  }

  try {
    const q2 = query(
        collection(db, 'poems'), 
        where('status', '==', 'published'), 
        where('tags', 'array-contains-any', ['Amor']), 
        limit(10)
    );
    const snap2 = await getDocs(q2);
    console.log('Query 2 success. Docs:', snap2.size);
  } catch (err) {
    console.error('Query 2 error:', err.message);
  }
  process.exit(0);
}

testQuery();
