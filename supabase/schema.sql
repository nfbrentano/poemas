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
  published_at timestamp with time zone
);

-- Subscribers Table
CREATE TABLE public.subscribers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Email Logs
CREATE TABLE public.email_campaign_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  poem_id uuid REFERENCES public.poems(id) ON DELETE CASCADE,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status text DEFAULT 'success',
  details text
);

---------------------------------------------------------
-- Row Level Security (RLS) Policies
---------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_logs ENABLE ROW LEVEL SECURITY;

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
