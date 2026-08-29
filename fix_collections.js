import { initializeApp } from 'firebase/admin/app';
import { getFirestore } from 'firebase/admin/firestore';

const app = initializeApp();
const db = getFirestore();

async function fix() {
  const snapshot = await db.collection('collections').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.created_at) {
      await doc.ref.update({ created_at: new Date().toISOString() });
      count++;
      console.log(`Updated collection: ${data.name}`);
    }
  }
  console.log(`Updated ${count} collections.`);
}

fix().catch(console.error);
