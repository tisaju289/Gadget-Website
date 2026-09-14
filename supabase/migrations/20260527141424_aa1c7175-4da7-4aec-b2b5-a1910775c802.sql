ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS bottom_nav_phone text,
  ADD COLUMN IF NOT EXISTS bottom_nav_whatsapp text;