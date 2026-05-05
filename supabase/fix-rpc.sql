-- Fix: Remove audio_url from the RPC function since the column doesn't exist in the live DB
DROP FUNCTION IF EXISTS get_poem_with_navigation(text);

CREATE OR REPLACE FUNCTION get_poem_with_navigation(target_slug text)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  content text,
  excerpt text,
  tags text[],
  published_at timestamp with time zone,
  prev_slug text,
  prev_title text,
  next_slug text,
  next_title text
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH current_poem AS (
    SELECT p.id, p.title, p.slug, p.content, p.excerpt, p.tags, p.published_at 
    FROM public.poems p 
    WHERE p.slug = target_slug AND p.status = 'published'
    LIMIT 1
  ),
  prev_p AS (
    SELECT p.slug, p.title 
    FROM public.poems p 
    WHERE p.published_at < (SELECT cp.published_at FROM current_poem cp)
      AND p.status = 'published'
    ORDER BY p.published_at DESC LIMIT 1
  ),
  next_p AS (
    SELECT p.slug, p.title 
    FROM public.poems p 
    WHERE p.published_at > (SELECT cp.published_at FROM current_poem cp)
      AND p.status = 'published'
    ORDER BY p.published_at ASC LIMIT 1
  )
  SELECT 
    cp.id, cp.title, cp.slug, cp.content, cp.excerpt, cp.tags, cp.published_at,
    pp.slug as prev_slug, pp.title as prev_title,
    np.slug as next_slug, np.title as next_title
  FROM current_poem cp
  LEFT JOIN prev_p pp ON true
  LEFT JOIN next_p np ON true;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_poem_with_navigation(text) TO anon, authenticated, service_role;
