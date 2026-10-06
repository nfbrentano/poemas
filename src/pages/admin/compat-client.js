import { db, getFirebaseAuth, getFirebaseStorage, getFirebaseFunctions } from '../../utils/firebase.js';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

export const supabase = {
  auth: {
    getSession: async () => {
      const auth = await getFirebaseAuth();
      if (auth.currentUser) {
        try { localStorage.setItem('has_admin_session', '1'); } catch (_) {}
      } else {
        try { localStorage.removeItem('has_admin_session'); } catch (_) {}
      }
      return { data: { session: auth.currentUser } };
    },
    signOut: async () => {
      const auth = await getFirebaseAuth();
      await auth.signOut();
      try { localStorage.removeItem('has_admin_session'); } catch (_) {}
    }
  },
  from: (tableName) => {
    return {
      select: (fields) => {
        let q = collection(db, tableName);
        let constraints = [];
        let isSingle = false;
        
        const builder = {
          eq: (field, val) => {
            constraints.push(where(field, '==', val));
            return builder;
          },
          gte: (field, val) => {
            constraints.push(where(field, '>=', val));
            return builder;
          },
          order: (field, opts) => {
            constraints.push(orderBy(field, opts?.ascending ? 'asc' : 'desc'));
            return builder;
          },
          limit: (n) => {
            constraints.push(limit(n));
            return builder;
          },
          single: () => {
            isSingle = true;
            return builder;
          },
          then: async (resolve, reject) => {
            try {
              const finalQuery = query(q, ...constraints);
              const snapshot = await getDocs(finalQuery);
              const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              if (isSingle) {
                if (data.length === 0) return resolve({ data: null, error: null });
                return resolve({ data: data[0], error: null });
              }
              resolve({ data, error: null });
            } catch (error) {
              resolve({ data: null, error });
            }
          }
        };
        return builder;
      },
      insert: async (payload) => {
        try {
          const items = Array.isArray(payload) ? payload : [payload];
          const results = [];
          for (const item of items) {
             let docRef;
             if (item.id) {
               docRef = doc(db, tableName, item.id);
               await setDoc(docRef, item);
             } else {
               docRef = await addDoc(collection(db, tableName), item);
             }
             results.push({ id: docRef.id, ...item });
          }
          const data = Array.isArray(payload) ? results : results[0];
          return { data, error: null, select: () => ({ single: async () => ({ data: data, error: null }) }) };
        } catch(error) {
          return { error };
        }
      },
      update: (payload) => {
         return {
           eq: async (field, val) => {
              if (field === 'id') {
                 try {
                   await updateDoc(doc(db, tableName, val), payload);
                   return { error: null };
                 } catch(error) {
                   return { error };
                 }
              }
              return { error: new Error('Adapter only supports update by id') };
           }
         };
      },
      delete: () => {
         return {
           eq: async (field, val) => {
              if (field === 'id') {
                 try {
                   await deleteDoc(doc(db, tableName, val));
                   return { error: null };
                 } catch(error) {
                   return { error };
                 }
              } else if (tableName === 'collection_poems' && field === 'collection_id') {
                 try {
                    const q = query(collection(db, 'collection_poems'), where('collection_id', '==', val));
                    const snapshot = await getDocs(q);
                    await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, tableName, d.id))));
                    return { error: null };
                 } catch(error) {
                    return { error };
                 }
              }
              return { error: new Error('Adapter only supports delete by id or collection_id') };
           }
         };
      }
    };
  },
  storage: {
    from: (bucket) => ({
      upload: async (fileName, file, opts) => {
         try {
           const storage = await getFirebaseStorage();
           const storageRef = ref(storage, `${bucket}/${fileName}`);
           await uploadBytes(storageRef, file);
           return { data: { path: fileName }, error: null };
         } catch(error) {
           return { error };
         }
      },
      getPublicUrl: (fileName) => {
         return { data: { publicUrl: `https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(bucket + '%2F' + fileName)}?alt=media` } };
      }
    })
  },
  functions: {
    invoke: async (fnName, options) => {
       try {
         const functions = await getFirebaseFunctions();
         const callable = httpsCallable(functions, fnName);
         const result = await callable(options?.body);
         return { data: result.data, error: null };
       } catch (error) {
         return { error };
       }
    }
  },
  rpc: async () => ({ data: null, error: null })
};
