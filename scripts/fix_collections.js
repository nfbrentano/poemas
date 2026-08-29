import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const envConfig = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val) acc[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  // Query WITHOUT orderBy so we get all docs
  const snapshot = await getDocs(collection(db, 'collections'));
  let count = 0;
  for (const document of snapshot.docs) {
    const data = document.data();
    if (!data.created_at) {
      await updateDoc(doc(db, 'collections', document.id), { created_at: new Date().toISOString() });
      count++;
      console.log(`Updated collection: ${data.name}`);
    }
  }
  console.log(`Updated ${count} collections.`);
  process.exit(0);
}

fix().catch(console.error);
