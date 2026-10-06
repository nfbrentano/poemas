import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deactivate() {
  try {
    const q = query(collection(db, 'subscribers'), where('email', '==', 'simonecs05@hotmail.com'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Subscriber not found.');
      process.exit(0);
    }
    
    for (const d of snapshot.docs) {
      await updateDoc(doc(db, 'subscribers', d.id), {
        active: false,
        unsubscribed_at: new Date().toISOString()
      });
      console.log(`Deactivated ${d.id}`);
    }
  } catch (error) {
    console.error("Failed:", error);
  }
  process.exit(0);
}

deactivate();
