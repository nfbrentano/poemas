import { supabase } from './supabase.js';

const EMOJIS = ['🕯️', '💧', '🌿', '🌙', '✨'];

function getSessionId() {
  let id = localStorage.getItem('reaction_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('reaction_session_id', id);
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
