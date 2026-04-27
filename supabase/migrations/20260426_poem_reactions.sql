CREATE TABLE poem_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poem_id uuid REFERENCES poems(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('🕯️','💧','🌿','🌙','✨')),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poem_id, session_id, emoji)
);

-- RLS: leitura pública, inserção pública (sem auth)
ALTER TABLE poem_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_select" ON poem_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON poem_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "reactions_delete" ON poem_reactions FOR DELETE USING (true);
