import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';

// Run with: node --env-file=.env.local scripts/migrate-prev-next.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey) {
  console.error('Environment variables for Firebase are required.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log('Fetching published poems...');
  try {
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'published'),
      orderBy('published_at', 'desc')
    );
    const snapshot = await getDocs(q);
    const poems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${poems.length} published poems. Starting migration...`);

    let updated = 0;

    for (let i = 0; i < poems.length; i++) {
      const current = poems[i];
      const prev = poems[i + 1] ? poems[i + 1].slug : null;
      const next = poems[i - 1] ? poems[i - 1].slug : null;
      const prevTitle = poems[i + 1] ? poems[i + 1].title : null;
      const nextTitle = poems[i - 1] ? poems[i - 1].title : null;

      const docRef = doc(db, 'poems', current.id);
      
      const updateData = {
        prev_slug: prev,
        next_slug: next,
        prev_title: prevTitle,
        next_title: nextTitle
      };

      console.log(`[${i + 1}/${poems.length}] Updating "${current.title}"...`);
      await updateDoc(docRef, updateData);
      updated++;
    }

    console.log(`Migration complete! Successfully updated ${updated} poems.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
