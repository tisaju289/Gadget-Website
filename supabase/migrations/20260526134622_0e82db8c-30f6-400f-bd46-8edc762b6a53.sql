ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS variations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '[]'::jsonb;