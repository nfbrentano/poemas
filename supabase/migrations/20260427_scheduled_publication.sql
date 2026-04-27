-- 1. Add scheduled_at column
ALTER TABLE poems ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NULL;

-- 2. Update status constraint to include 'scheduled'
-- First, we need to find the name of the existing constraint. 
-- In the table listing, we saw 'status = ANY (ARRAY['draft'::text, 'published'::text])'
-- We'll drop the old check and add a new one.
ALTER TABLE poems DROP CONSTRAINT IF EXISTS poems_status_check;
ALTER TABLE poems ADD CONSTRAINT poems_status_check CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'scheduled'::text]));

-- 3. Setup pg_cron job (if extensions are enabled)
-- Note: User mentioned they will handle secrets separately, but we provide the logic.
-- This assumes vault.decrypted_secrets exists as per standard Supabase setups for Cron.

-- Ensure pg_cron and pg_net are enabled (standard in Supabase for this use case)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'publish-scheduled-poems-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/publish-scheduled-poems',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
      ),
      body := jsonb_build_object('time', now())
    ) AS request_id;
  $$
);
