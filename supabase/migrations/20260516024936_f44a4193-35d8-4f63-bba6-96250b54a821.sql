
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT FALSE,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  heading_font TEXT NOT NULL,
  body_font TEXT NOT NULL,
  background_texture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public read menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "public read gallery" ON public.gallery FOR SELECT USING (true);

-- Admin writes (anon key, since admin is a client-side password gate)
CREATE POLICY "anon write themes" ON public.themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-images', 'restaurant-images', true);

CREATE POLICY "public read restaurant-images" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-images');
CREATE POLICY "anon write restaurant-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'restaurant-images');
CREATE POLICY "anon update restaurant-images" ON storage.objects FOR UPDATE USING (bucket_id = 'restaurant-images');
CREATE POLICY "anon delete restaurant-images" ON storage.objects FOR DELETE USING (bucket_id = 'restaurant-images');
