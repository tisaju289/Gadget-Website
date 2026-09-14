CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Nexio',
  logo_url text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  singleton boolean NOT NULL DEFAULT true UNIQUE
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site settings" ON public.site_settings
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage site settings" ON public.site_settings
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (site_name) VALUES ('Nexio');