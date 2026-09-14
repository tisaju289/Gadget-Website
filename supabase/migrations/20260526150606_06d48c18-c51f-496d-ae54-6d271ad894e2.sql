
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS show_topbar boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_megamenu boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_hotline boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_preorder_btn boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_header_search boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_footer_branches boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_footer_company boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_footer_help boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_footer_terms boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_footer_socials boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_mobile_bottom_nav boolean NOT NULL DEFAULT true;
