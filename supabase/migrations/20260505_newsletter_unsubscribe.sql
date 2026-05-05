ALTER TABLE public.subscribers
ADD COLUMN unsubscribe_token uuid DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN unsubscribed_at timestamp with time zone;
