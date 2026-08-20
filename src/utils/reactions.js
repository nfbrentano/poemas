import { supabase } from './supabase.js';

const EMOJIS = ['🕯️', '💧', '🌿', '🌙', '✨'];

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
  const { data, error } = await supabase
    .from('poem_reactions')
    .select('emoji, session_id')
    .eq('poem_id', poemId);
  if (error) return { counts: {}, userReactions: new Set() };

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
  const { data: existing } = await supabase
    .from('poem_reactions')
    .select('id')
    .eq('poem_id', poemId)
    .eq('session_id', sessionId)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from('poem_reactions').delete().eq('id', existing.id);
    return 'removed';
  } else {
    await supabase.from('poem_reactions').insert({ poem_id: poemId, emoji, session_id: sessionId });
    return 'added';
  }
}

export { EMOJIS };
