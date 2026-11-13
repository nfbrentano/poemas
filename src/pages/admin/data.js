import { db, getFirebaseAuth, getFirebaseStorage, getFirebaseFunctions } from '../../utils/firebase.js';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { invalidatePoemsCache } from '../../utils/poems-store.js';

// Acesso a dados do painel admin. As funções assíncronas devolvem { data, error }
// (sem lançar exceção) para que cada tela trate o erro como sempre tratou.

function setAdminFlag(on) {
  try {
    if (on) localStorage.setItem('has_admin_session', '1');
    else localStorage.removeItem('has_admin_session');
  } catch (_) {}
}

/** Usuário admin logado ou null. Mantém o flag local `has_admin_session` em dia. */
export async function getAdminSession() {
  const auth = await getFirebaseAuth();
  setAdminFlag(!!auth.currentUser);
  return auth.currentUser;
}

export async function signOutAdmin() {
  const auth = await getFirebaseAuth();
  await auth.signOut();
  setAdminFlag(false);
}

/**
 * Lista documentos. `where` é uma lista de [campo, operador, valor] e `orderBy` é [campo, 'asc' | 'desc'].
 * Com `single: true` devolve só o primeiro documento (ou null). Cada documento traz `id` do Firestore.
 * Atenção: `where: [['id', '==', x]]` filtra pelo CAMPO `id`, não pelo ID do documento.
 */
export async function listDocs(collectionName, { where: filters = [], orderBy: order, limit: max, single = false } = {}) {
  try {
    const constraints = filters.map(([field, op, value]) => where(field, op, value));
    if (order) constraints.push(orderBy(order[0], order[1]));
    if (max) constraints.push(limit(max));
    const snapshot = await getDocs(query(collection(db, collectionName), ...constraints));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data: single ? (data[0] ?? null) : data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Busca um documento diretamente pelo seu ID real no Firestore. Devolve { data, error }.
 * data traz { id: docSnap.id, ...docSnap.data() } ou null se não existir.
 */
export async function getDocById(collectionName, id) {
  try {
    const docSnap = await getDoc(doc(db, collectionName, id));
    if (!docSnap.exists()) {
      return { data: null, error: null };
    }
    return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/** Cria um ou vários documentos. Com `id` no item grava com esse ID. Devolve o documento (ou lista) criado. */
export async function insertDocs(collectionName, payload) {
  try {
    const items = Array.isArray(payload) ? payload : [payload];
    const results = [];
    for (const item of items) {
      let docRef;
      if (item.id) {
        docRef = doc(db, collectionName, item.id);
        await setDoc(docRef, item);
      } else {
        docRef = await addDoc(collection(db, collectionName), item);
      }
      results.push({ id: docRef.id, ...item });
    }
    if (collectionName === 'poems' || collectionName === 'collection_poems') {
      invalidatePoemsCache();
    }
    return { data: Array.isArray(payload) ? results : results[0], error: null };
  } catch (error) {
    return { error };
  }
}

export async function updateDocById(collectionName, id, payload) {
  try {
    await updateDoc(doc(db, collectionName, id), payload);
    if (collectionName === 'poems' || collectionName === 'collection_poems') {
      invalidatePoemsCache();
    }
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function deleteDocById(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
    if (collectionName === 'poems' || collectionName === 'collection_poems') {
      invalidatePoemsCache();
    }
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/** Remove todos os documentos de `collectionName` cujo `field` seja igual a `value`. */
export async function deleteDocsWhere(collectionName, field, value) {
  try {
    const snapshot = await getDocs(query(collection(db, collectionName), where(field, '==', value)));
    await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, collectionName, d.id))));
    if (collectionName === 'poems' || collectionName === 'collection_poems') {
      invalidatePoemsCache();
    }
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Substitui atomicamente todas as relações de uma coleção em `collection_poems`.
 * Deleta as relações anteriores e insere as novas em um único writeBatch (RNF03).
 * Sincroniza automaticamente o campo `collection_slugs` nos documentos de `poems` afetados (RF05).
 * @param {string} collectionId
 * @param {Array<{ poem_id: string, order?: number | null }>} relations
 * @param {Object} [options]
 * @param {string} [options.collectionSlug] Slug da coleção
 * @returns {Promise<{ error: Error | null }>}
 */
export async function replaceCollectionPoems(collectionId, relations = [], options = {}) {
  try {
    const snapshot = await getDocs(query(collection(db, 'collection_poems'), where('collection_id', '==', collectionId)));
    const previousPoemIds = snapshot.docs.map(d => d.data()?.poem_id).filter(Boolean);
    const currentPoemIds = relations.map(r => r.poem_id).filter(Boolean);

    let slug = options.collectionSlug;
    if (!slug) {
      try {
        const colSnap = await getDoc(doc(db, 'collections', collectionId));
        if (colSnap && colSnap.exists()) {
          slug = colSnap.data()?.slug;
        }
      } catch (_) {}
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      batch.delete(doc(db, 'collection_poems', d.id));
    });
    relations.forEach(item => {
      const docRef = doc(collection(db, 'collection_poems'));
      batch.set(docRef, { ...item, collection_id: collectionId });
    });

    if (slug) {
      const removedPoemIds = previousPoemIds.filter(id => !currentPoemIds.includes(id));
      const addedPoemIds = currentPoemIds;

      for (const poemId of removedPoemIds) {
        try {
          const pRef = doc(db, 'poems', poemId);
          const pSnap = await getDoc(pRef);
          if (pSnap && pSnap.exists()) {
            const currentSlugs = pSnap.data()?.collection_slugs || [];
            if (currentSlugs.includes(slug)) {
              batch.update(pRef, {
                collection_slugs: currentSlugs.filter(s => s !== slug),
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (_) {}
      }

      for (const poemId of addedPoemIds) {
        try {
          const pRef = doc(db, 'poems', poemId);
          const pSnap = await getDoc(pRef);
          if (pSnap && pSnap.exists()) {
            const currentSlugs = pSnap.data()?.collection_slugs || [];
            if (!currentSlugs.includes(slug)) {
              batch.update(pRef, {
                collection_slugs: [...currentSlugs, slug],
                updated_at: new Date().toISOString()
              });
            }
          }
        } catch (_) {}
      }
    }

    await batch.commit();
    invalidatePoemsCache();
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function uploadFile(bucket, fileName, file) {
  try {
    const storage = await getFirebaseStorage();
    await uploadBytes(ref(storage, `${bucket}/${fileName}`), file);
    return { data: { path: fileName }, error: null };
  } catch (error) {
    return { error };
  }
}

/** URL pública do arquivo. Mantém a codificação histórica (`%2F` codificado de novo). */
export function getPublicFileUrl(bucket, fileName) {
  return `https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(bucket + '%2F' + fileName)}?alt=media`;
}

export async function callFunction(name, body) {
  try {
    const functions = await getFirebaseFunctions();
    const result = await httpsCallable(functions, name)(body);
    return { data: result.data, error: null };
  } catch (error) {
    return { error };
  }
}
