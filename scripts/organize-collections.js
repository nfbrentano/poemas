import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const collections = [
  { title: 'Amor e Conexão', slug: 'amor-e-conexao', description: 'Poemas que exploram os laços de afeto, os encontros e a profundidade do amor em suas diversas formas.', tags: ['amor', 'abraço', 'conexão', 'coração'] },
  { title: 'Reflexões e Tempo', slug: 'reflexoes-e-tempo', description: 'Uma jornada interna sobre a passagem do tempo, a vida e os sentimentos mais profundos da alma.', tags: ['tempo', 'vida', 'reflexão', 'Sentimentos', 'alma', 'sonhos'] },
  { title: 'Paz e Esperança', slug: 'paz-e-esperanca', description: 'Versos que trazem calma, fé e a esperança em dias melhores e novos recomeços.', tags: ['paz', 'esperança', 'fé', 'recomeço', 'futuro'] },
  { title: 'Família e Afeto', slug: 'familia-e-afeto', description: 'Uma homenagem àqueles que são nosso lar: a família, as alegrias diárias e a saudade de quem amamos.', tags: ['filha', 'família', 'saudade', 'alegria', 'felicidade'] }
];

async function run() {
  const { data: poems } = await supabase.from('poems').select('id, title, tags');
  
  for (const col of collections) {
    let { data: existingCol } = await supabase.from('collections').select('id').eq('slug', col.slug).single();
    let colId;
    if (!existingCol) {
      const { data: newCol } = await supabase.from('collections').insert([{ title: col.title, slug: col.slug, description: col.description }]).select().single();
      colId = newCol.id;
    } else {
      colId = existingCol.id;
    }

    const matchingPoems = poems.filter(p => p.tags && p.tags.some(t => col.tags.includes(t)));
    
    const relations = matchingPoems.map(p => ({
      collection_id: colId,
      poem_id: p.id
    }));
    
    if (relations.length > 0) {
      await supabase.from('collection_poems').delete().eq('collection_id', colId);
      
      const chunkedRelations = [];
      for(let i = 0; i < relations.length; i += 100) {
          chunkedRelations.push(relations.slice(i, i + 100));
      }

      for (const chunk of chunkedRelations) {
        const { error } = await supabase.from('collection_poems').insert(chunk);
        if (error) {
           console.error('Error inserting relations', error);
        }
      }
      
      console.log(`Added ${relations.length} poems to '${col.title}'`);
    }
  }
}
run();
