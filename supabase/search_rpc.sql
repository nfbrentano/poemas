-- Função de busca Full-Text para Poemas
-- Esta função permite buscar por título, trecho, conteúdo e tags.

CREATE OR REPLACE FUNCTION search_poems(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  tags text[],
  published_at timestamp with time zone
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.title, 
    p.slug, 
    p.excerpt, 
    p.tags, 
    p.published_at
  FROM public.poems p
  WHERE (
    to_tsvector('portuguese', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content) @@ websearch_to_tsquery('portuguese', search_query)
    OR p.title ILIKE '%' || search_query || '%'
    OR search_query = ANY(p.tags)
  )
  AND p.status = 'published'
  ORDER BY ts_rank(to_tsvector('portuguese', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content), websearch_to_tsquery('portuguese', search_query)) DESC, 
           p.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Permissão para usuários não autenticados
GRANT EXECUTE ON FUNCTION search_poems(text) TO anon, authenticated, service_role;
