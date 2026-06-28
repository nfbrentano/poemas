const DB_NAME = 'poemas_db';
const STORE_NAME = 'poem_notes';
const DB_VERSION = 2;

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

export const notes = {
  async get(slug) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(slug);
      request.onsuccess = () => resolve(request.result ? request.result.note : '');
      request.onerror = () => reject(request.error);
    });
  },

  async save(slug, note) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const data = {
        slug,
        note,
        updated_at: new Date().toISOString()
      };
      const request = store.put(data);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(slug) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(slug);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
};
