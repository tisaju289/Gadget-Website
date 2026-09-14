
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS header_hotline text,
  ADD COLUMN IF NOT EXISTS topbar_phone text,
  ADD COLUMN IF NOT EXISTS footer_tagline text,
  ADD COLUMN IF NOT EXISTS footer_email text,
  ADD COLUMN IF NOT EXISTS footer_facebook text,
  ADD COLUMN IF NOT EXISTS footer_instagram text,
  ADD COLUMN IF NOT EXISTS footer_youtube text,
  ADD COLUMN IF NOT EXISTS footer_linkedin text,
  ADD COLUMN IF NOT EXISTS footer_copyright text,
  ADD COLUMN IF NOT EXISTS footer_branches jsonb NOT NULL DEFAULT '[]'::jsonb;
