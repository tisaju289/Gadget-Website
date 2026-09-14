ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS checkout_title text,
  ADD COLUMN IF NOT EXISTS checkout_inside_label text,
  ADD COLUMN IF NOT EXISTS checkout_inside_fee numeric,
  ADD COLUMN IF NOT EXISTS checkout_inside_note text,
  ADD COLUMN IF NOT EXISTS checkout_outside_label text,
  ADD COLUMN IF NOT EXISTS checkout_outside_fee numeric,
  ADD COLUMN IF NOT EXISTS checkout_outside_note text,
  ADD COLUMN IF NOT EXISTS checkout_cod_label text,
  ADD COLUMN IF NOT EXISTS checkout_cod_note text,
  ADD COLUMN IF NOT EXISTS checkout_success_title text,
  ADD COLUMN IF NOT EXISTS checkout_success_message text,
  ADD COLUMN IF NOT EXISTS checkout_terms_text text,
  ADD COLUMN IF NOT EXISTS checkout_show_note_field boolean NOT NULL DEFAULT true;