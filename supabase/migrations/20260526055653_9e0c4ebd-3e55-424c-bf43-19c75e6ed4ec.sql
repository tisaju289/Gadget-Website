
-- =========== ROLES ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by owner" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========== TIMESTAMP TRIGGER ===========
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== SIGNUP TRIGGER ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== CATEGORIES ===========
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public read active categories" ON public.categories
FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.categories
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== SUBCATEGORIES ===========
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subcategories_updated_at BEFORE UPDATE ON public.subcategories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public read active subcategories" ON public.subcategories
FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subcategories" ON public.subcategories
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== PRODUCTS ===========
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT,
  description TEXT,
  image_url TEXT,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  label TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_flash_sale BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_flags ON public.products(is_active, is_featured, is_flash_sale, is_new_arrival);
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public read active products" ON public.products
FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== BANNERS ===========
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'hero',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON public.banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public read active banners" ON public.banners
FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage banners" ON public.banners
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== STORAGE ===========
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product images" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
