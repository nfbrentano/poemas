-- Analytics: Page Views Table
-- Run this migration in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  page text NOT NULL,                          -- e.g. '/', '/poema/ao-mar'
  poem_id uuid REFERENCES public.poems(id) ON DELETE SET NULL,
  ip_hash text,                                -- SHA-256 hash of IP (privacy-safe)
  country text,                                -- from CF-IPCountry header or ipapi
  user_agent text,
  referrer text,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries on dashboard
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page      ON public.page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_poem_id   ON public.page_views(poem_id);

-- RLS: Public can INSERT (tracking), only auth can SELECT/DELETE
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can track views"
ON public.page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin can read views"
ON public.page_views FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete views"
ON public.page_views FOR DELETE
USING (auth.role() = 'authenticated');
