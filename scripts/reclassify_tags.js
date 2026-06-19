import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const poems = JSON.parse(fs.readFileSync('scripts/poems_dump.json', 'utf8'));

// Core tag mappings
const tagGroups = {
  "Amor": ["amor", "paixão", "coração", "romance", "desejo", "beijo", "abraço", "amar", "afeto", "carinho", "reciprocidade", "encontro", "conexão"],
  "Sentimentos": ["sentimentos", "emoção", "emoções", "sinceridade", "verdade", "saudade", "lágrimas", "melancolia", "dor", "tristeza", "medo", "solidão", "angústia", "choro"],
  "Vida": ["vida", "viver", "existência", "tempo", "futuro", "passado", "recomeço", "caminho", "jornada", "destino", "escolhas", "mudança", "tempo"],
  "Família": ["família", "mãe", "pai", "filha", "filho", "irmão", "lar", "ancestralidade"],
  "Paz e Esperança": ["paz", "esperança", "fé", "luz", "cura", "calma", "equilíbrio", "sol", "alegria", "felicidade", "sorriso", "resiliência", "proteção", "axé"],
  "Reflexão": ["reflexão", "pensamentos", "alma", "silêncio", "aprendizado", "autoconhecimento", "sonhos", "energia", "mente", "eu", "autorretrato", "solitude", "essência"]
};

// Flatten to old -> new mapping for exact tag matches
const tagMapping = {};
for (const [core, oldTags] of Object.entries(tagGroups)) {
  for (const old of oldTags) {
    tagMapping[old.toLowerCase()] = core;
  }
}

async function run() {
  let updatedCount = 0;
  
  for (const poem of poems) {
    let newTags = new Set();
    
    // 1. Map existing tags
    if (poem.tags && Array.isArray(poem.tags)) {
      for (const t of poem.tags) {
        const lower = t.trim().toLowerCase();
        if (tagMapping[lower]) {
          newTags.add(tagMapping[lower]);
        } else {
          // If it's a completely unknown tag but we want to keep some diversity, we could add it capitalized
          // But to strictly organize, we can try to find a keyword match in the tag itself
          for (const [core, oldTags] of Object.entries(tagGroups)) {
            if (oldTags.some(ot => lower.includes(ot))) {
              newTags.add(core);
            }
          }
        }
      }
    }
    
    // 2. If not enough tags, analyze content
    if (newTags.size < 3 && poem.content) {
      const contentLower = poem.content.toLowerCase();
      for (const [core, keywords] of Object.entries(tagGroups)) {
        if (newTags.size >= 3) break;
        if (!newTags.has(core)) {
          // Check if any keyword appears in the content
          if (keywords.some(kw => contentLower.includes(kw))) {
            newTags.add(core);
          }
        }
      }
    }
    
    // Default tag if none found
    if (newTags.size === 0) {
      newTags.add("Reflexão");
    }
    
    // Limit to max 3 tags
    const finalTags = Array.from(newTags).slice(0, 3);
    
    // Update in Supabase
    const { error } = await supabase
      .from('poems')
      .update({ tags: finalTags })
      .eq('id', poem.id);
      
    if (error) {
      console.error(`Error updating poem ${poem.id}:`, error);
    } else {
      updatedCount++;
    }
  }
  
  console.log(`Successfully reclassified and updated ${updatedCount} poems!`);
}

run();
