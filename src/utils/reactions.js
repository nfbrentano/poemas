import { db } from './firebase.js';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const EMOJIS = ['🕯️', '💧', '🌿', '🌙', '✨', '❤️'];

function getSessionId() {
  let id = localStorage.getItem('reaction_session_id');
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
      id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    if (id) {
      localStorage.setItem('reaction_session_id', id);
    }
  }
  return id;
}

export async function loadReactions(poemId) {
  let data = [];
  try {
    const q = query(collection(db, 'poem_reactions'), where('poem_id', '==', poemId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
  } catch (error) {
    return { counts: {}, userReactions: new Set() };
  }

  const sessionId = getSessionId();
  const counts = {};
  const userReactions = new Set();
  EMOJIS.forEach(e => counts[e] = 0);
  (data || []).forEach(row => {
    counts[row.emoji] = (counts[row.emoji] || 0) + 1;
    if (row.session_id === sessionId) userReactions.add(row.emoji);
  });
  return { counts, userReactions };
}

export async function toggleReaction(poemId, emoji) {
  const sessionId = getSessionId();
  try {
    const q = query(
      collection(db, 'poem_reactions'),
      where('poem_id', '==', poemId),
      where('session_id', '==', sessionId),
      where('emoji', '==', emoji)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, 'poem_reactions', existingDoc.id));
      return 'removed';
    } else {
      await addDoc(collection(db, 'poem_reactions'), { poem_id: poemId, emoji, session_id: sessionId });
      return 'added';
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return null;
  }
}

export { EMOJIS };
