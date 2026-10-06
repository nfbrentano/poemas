import { db, getFirebaseAuth, getFirebaseStorage, getFirebaseFunctions } from '../../utils/firebase.js';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

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
    return { data: Array.isArray(payload) ? results : results[0], error: null };
  } catch (error) {
    return { error };
  }
}

export async function updateDocById(collectionName, id, payload) {
  try {
    await updateDoc(doc(db, collectionName, id), payload);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function deleteDocById(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
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
