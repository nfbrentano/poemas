import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

/**
 * Migrates existing poems by populating updated_at with published_at (or created_at)
 * if updated_at is not already present.
 * Idempotent: running multiple times will not overwrite existing updated_at values.
 *
 * @param {import('firebase/firestore').Firestore} db
 * @returns {Promise<{ total: number, updatedCount: number, skippedCount: number }>}
 */
export async function migrateUpdatedAt(db) {
  const poemsSnapshot = await getDocs(collection(db, 'poems'));
  let updatedCount = 0;
  let skippedCount = 0;

  for (const docSnap of poemsSnapshot.docs) {
    const data = docSnap.data();
    if (!data.updated_at) {
      const fallbackDate = data.published_at || data.created_at || new Date().toISOString();
      await updateDoc(doc(db, 'poems', docSnap.id), {
        updated_at: fallbackDate
      });
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  return {
    total: poemsSnapshot.docs.length,
    updatedCount,
    skippedCount
  };
}

// Auto-run if executed directly as a script
if (process.argv[1] && process.argv[1].endsWith('migrate-updated-at.js')) {
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

  console.log('Starting migration: populating updated_at for existing poems...');
  migrateUpdatedAt(db)
    .then(result => {
      console.log(`Migration complete! Total: ${result.total}, Updated: ${result.updatedCount}, Skipped: ${result.skippedCount}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
