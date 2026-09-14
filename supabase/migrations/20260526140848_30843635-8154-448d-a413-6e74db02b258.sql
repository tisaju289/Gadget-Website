CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE DEFAULT ('ORD-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random()*100000))::text, 5, '0')),
  customer_name text NOT NULL,
  customer_mobile text NOT NULL,
  customer_address text NOT NULL,
  delivery_option text NOT NULL DEFAULT 'inside',
  delivery_fee numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cod',
  note text,
  status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins read orders" ON public.orders
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX orders_status_idx ON public.orders (status);