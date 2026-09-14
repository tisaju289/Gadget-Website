
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS meta_keywords text,
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS og_image_url text;
