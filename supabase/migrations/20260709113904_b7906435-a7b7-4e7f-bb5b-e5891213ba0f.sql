ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS home_category_per_row integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS home_brand_per_row integer NOT NULL DEFAULT 4;

UPDATE public.site_settings
SET
  home_category_per_row = LEAST(GREATEST(COALESCE(home_category_per_row, 6), 2), 8),
  home_brand_per_row = LEAST(GREATEST(COALESCE(home_brand_per_row, 4), 2), 6);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;