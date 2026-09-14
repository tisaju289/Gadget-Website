
CREATE TABLE public.preorders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preorder_number text NOT NULL DEFAULT ('PRE-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 100000)::text, 5, '0')),
  customer_name text NOT NULL,
  customer_mobile text NOT NULL,
  customer_address text,
  product_name text NOT NULL,
  product_link text,
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  budget numeric,
  advance_paid numeric NOT NULL DEFAULT 0,
  note text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.preorders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.preorders TO authenticated;
GRANT ALL ON public.preorders TO service_role;

ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create preorders" ON public.preorders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins read preorders" ON public.preorders
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update preorders" ON public.preorders
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete preorders" ON public.preorders
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_preorders_updated_at
  BEFORE UPDATE ON public.preorders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
