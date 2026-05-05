-- Supabase Schema for Poemas de Natanael

-- Profiles Table (For Admin)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  role text DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Poems Table
CREATE TABLE public.poems (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  tags text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone
);

-- Subscribers Table
CREATE TABLE public.subscribers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  unsubscribe_token uuid DEFAULT gen_random_uuid() UNIQUE,
  unsubscribed_at timestamp with time zone
);

-- Email Logs
CREATE TABLE public.email_campaign_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  poem_id uuid REFERENCES public.poems(id) ON DELETE CASCADE,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status text DEFAULT 'success',
  details text
);

-- Comments Table
CREATE TABLE public.poem_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  poem_id uuid REFERENCES public.poems(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Settings
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Collections Table
CREATE TABLE public.collections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Join table for Poems and Collections
CREATE TABLE public.collection_poems (
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  poem_id uuid REFERENCES public.poems(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, poem_id)
);

-- Reactions Table
CREATE TABLE public.poem_reactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  poem_id uuid REFERENCES public.poems(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  session_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- Row Level Security (RLS) Policies
---------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poem_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poem_reactions ENABLE ROW LEVEL SECURITY;

-- Reactions: Public can view and manage their own (session-based)
CREATE POLICY "Public can view reactions" 
ON public.poem_reactions FOR SELECT 
USING (true);

CREATE POLICY "Public can manage reactions" 
ON public.poem_reactions FOR ALL 
USING (true);

-- Poems: Public can read published. Auth users can do all.
CREATE POLICY "Public can view published poems" 
ON public.poems FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authenticated users can do all on poems" 
ON public.poems FOR ALL 
USING (auth.role() = 'authenticated');

-- Subscribers: Public can insert. Only auth can view/edit.
CREATE POLICY "Public can subscribe" 
ON public.subscribers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can manage subscribers" 
ON public.subscribers FOR ALL 
USING (auth.role() = 'authenticated');

-- Profiles: Admin only
CREATE POLICY "Admin can manage profiles" 
ON public.profiles FOR ALL 
USING (auth.role() = 'authenticated');

-- Email Logs: Admin only
CREATE POLICY "Admin can manage logs" 
ON public.email_campaign_logs FOR ALL 
USING (auth.role() = 'authenticated');

-- Comments: Public can insert (not approved), Public can view approved, Admin all.
CREATE POLICY "Public can view approved comments" 
ON public.poem_comments FOR SELECT 
USING (approved = true);

CREATE POLICY "Public can post comments" 
ON public.poem_comments FOR INSERT 
WITH CHECK (approved = false);

CREATE POLICY "Admin can manage comments" 
ON public.poem_comments FOR ALL 
USING (auth.role() = 'authenticated');

-- Site Settings: Public select, Admin all
CREATE POLICY "Public can view settings" 
ON public.site_settings FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage settings" 
ON public.site_settings FOR ALL 
USING (auth.role() = 'authenticated');

-- Collections: Public view, Admin all
CREATE POLICY "Public can view collections" 
ON public.collections FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage collections" 
ON public.collections FOR ALL 
USING (auth.role() = 'authenticated');

-- Collection Poems: Public view, Admin all
CREATE POLICY "Public can view collection links" 
ON public.collection_poems FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage collection links" 
ON public.collection_poems FOR ALL 
USING (auth.role() = 'authenticated');

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RPC Function for Poem Navigation
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

-- Essential: Grant permission to the anon role to allow unauthenticated users to call this
GRANT EXECUTE ON FUNCTION get_poem_with_navigation(text) TO anon, authenticated, service_role;
