ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS nav_category_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS home_category_limit integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS home_brand_limit integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS home_featured_per_row integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS home_best_selling_per_row integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS home_new_arrivals_per_row integer NOT NULL DEFAULT 6;

UPDATE public.site_settings
SET
  nav_category_links = COALESCE(nav_category_links, '[]'::jsonb),
  home_category_limit = LEAST(GREATEST(COALESCE(home_category_limit, 8), 2), 12),
  home_brand_limit = LEAST(GREATEST(COALESCE(home_brand_limit, 8), 2), 16),
  home_featured_per_row = LEAST(GREATEST(COALESCE(home_featured_per_row, 6), 2), 8),
  home_best_selling_per_row = LEAST(GREATEST(COALESCE(home_best_selling_per_row, 6), 2), 8),
  home_new_arrivals_per_row = LEAST(GREATEST(COALESCE(home_new_arrivals_per_row, 6), 2), 8);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;