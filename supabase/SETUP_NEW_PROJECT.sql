-- =====================================================================
-- Stay Manila Diner — full DB setup for the NEW Supabase project.
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Security model: PUBLIC can READ everything; only AUTHENTICATED (logged-in
-- admin via Supabase Auth) can INSERT / UPDATE / DELETE.
-- =====================================================================

-- ---------- TABLES ----------

CREATE TABLE IF NOT EXISTS public.themes (
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

CREATE TABLE IF NOT EXISTS public.restaurant_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  style_id uuid REFERENCES public.restaurant_styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  style_id uuid REFERENCES public.restaurant_styles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.style_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id uuid NOT NULL REFERENCES public.restaurant_styles(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_categories_style ON public.categories(style_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_style ON public.menu_items(style_id);

-- ---------- ROW LEVEL SECURITY ----------

ALTER TABLE public.themes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_styles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_schedules    ENABLE ROW LEVEL SECURITY;

-- Public READ (anyone, incl. anonymous visitors)
DROP POLICY IF EXISTS "public read themes"            ON public.themes;
DROP POLICY IF EXISTS "public read restaurant_styles" ON public.restaurant_styles;
DROP POLICY IF EXISTS "public read categories"        ON public.categories;
DROP POLICY IF EXISTS "public read menu_items"        ON public.menu_items;
DROP POLICY IF EXISTS "public read site_settings"     ON public.site_settings;
DROP POLICY IF EXISTS "public read gallery"           ON public.gallery;
DROP POLICY IF EXISTS "public read style_schedules"   ON public.style_schedules;

CREATE POLICY "public read themes"            ON public.themes            FOR SELECT USING (true);
CREATE POLICY "public read restaurant_styles" ON public.restaurant_styles FOR SELECT USING (true);
CREATE POLICY "public read categories"        ON public.categories        FOR SELECT USING (true);
CREATE POLICY "public read menu_items"        ON public.menu_items        FOR SELECT USING (true);
CREATE POLICY "public read site_settings"     ON public.site_settings     FOR SELECT USING (true);
CREATE POLICY "public read gallery"           ON public.gallery           FOR SELECT USING (true);
CREATE POLICY "public read style_schedules"   ON public.style_schedules   FOR SELECT USING (true);

-- Authenticated WRITE (logged-in admin only: INSERT / UPDATE / DELETE)
DROP POLICY IF EXISTS "auth write themes"            ON public.themes;
DROP POLICY IF EXISTS "auth write restaurant_styles" ON public.restaurant_styles;
DROP POLICY IF EXISTS "auth write categories"        ON public.categories;
DROP POLICY IF EXISTS "auth write menu_items"        ON public.menu_items;
DROP POLICY IF EXISTS "auth write site_settings"     ON public.site_settings;
DROP POLICY IF EXISTS "auth write gallery"           ON public.gallery;
DROP POLICY IF EXISTS "auth write style_schedules"   ON public.style_schedules;

CREATE POLICY "auth write themes"            ON public.themes            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write restaurant_styles" ON public.restaurant_styles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write categories"        ON public.categories        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write menu_items"        ON public.menu_items        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write site_settings"     ON public.site_settings     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write gallery"           ON public.gallery           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth write style_schedules"   ON public.style_schedules   FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------- STORAGE BUCKET (restaurant-images, public read) ----------

INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read restaurant-images"   ON storage.objects;
DROP POLICY IF EXISTS "auth write restaurant-images"    ON storage.objects;
DROP POLICY IF EXISTS "auth update restaurant-images"   ON storage.objects;
DROP POLICY IF EXISTS "auth delete restaurant-images"   ON storage.objects;

CREATE POLICY "public read restaurant-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-images');

CREATE POLICY "auth write restaurant-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');

CREATE POLICY "auth update restaurant-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'restaurant-images');

CREATE POLICY "auth delete restaurant-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'restaurant-images');

-- ---------- SEED DATA (default menu / gallery / settings) ----------
-- Runs as admin here so it works even with the secure RLS above.
-- Guarded so re-running this whole script won't duplicate rows.

-- site_settings
INSERT INTO public.site_settings (key, value) VALUES
  ('restaurant_name', 'Stay Manila Diner'),
  ('tagline',         'Lutong Puso, Manila Proud.'),
  ('hero_image_url',  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80'),
  ('about_text',      'A cozy corner where authentic Asian flavors come alive. Every dish is crafted with love, tradition, and the finest ingredients sourced from across the region.'),
  ('address',         '123 Food Street, Brgy. Sample, Calamba, Laguna'),
  ('phone',           '+63 912 345 6789'),
  ('email',           'hello@staymaniladiner.com'),
  ('hours_weekday',   'Monday – Friday: 10:00 AM – 10:00 PM'),
  ('hours_weekend',   'Saturday – Sunday: 9:00 AM – 11:00 PM'),
  ('facebook_url',    'https://facebook.com'),
  ('instagram_url',   'https://instagram.com'),
  ('google_maps_embed', '')
ON CONFLICT (key) DO NOTHING;

-- Seed menu only if empty (avoids duplicates on re-run)
DO $$
DECLARE
  v_style_id uuid;
  v_appetizers uuid;
  v_main uuid;
  v_desserts uuid;
  v_drinks uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.menu_items LIMIT 1) THEN
    RETURN;
  END IF;

  -- default style
  INSERT INTO public.restaurant_styles (name, slug, description, is_default, sort_order)
  VALUES ('House Menu', 'house-menu', 'Default menu', true, 0)
  RETURNING id INTO v_style_id;

  -- categories
  INSERT INTO public.categories (name, sort_order, style_id) VALUES ('Appetizers', 1, v_style_id) RETURNING id INTO v_appetizers;
  INSERT INTO public.categories (name, sort_order, style_id) VALUES ('Main Course', 2, v_style_id) RETURNING id INTO v_main;
  INSERT INTO public.categories (name, sort_order, style_id) VALUES ('Desserts', 3, v_style_id) RETURNING id INTO v_desserts;
  INSERT INTO public.categories (name, sort_order, style_id) VALUES ('Drinks', 4, v_style_id) RETURNING id INTO v_drinks;

  -- menu items
  INSERT INTO public.menu_items (category_id, style_id, name, description, price, image_url, is_available, sort_order) VALUES
    (v_appetizers, v_style_id, 'Gyoza (6 pcs)', 'Pan-fried Japanese dumplings filled with minced pork and cabbage, served with ponzu dipping sauce.', 180, 'https://images.unsplash.com/photo-1599789197514-47270cd526b4?w=600&q=80', true, 1),
    (v_appetizers, v_style_id, 'Edamame', 'Lightly salted steamed soybeans — the perfect starter while you wait.', 120, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80', true, 2),
    (v_appetizers, v_style_id, 'Miso Soup', 'Traditional Japanese miso broth with silken tofu, wakame seaweed, and green onions.', 95, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80', true, 3),
    (v_appetizers, v_style_id, 'Spring Rolls (4 pcs)', 'Crispy fried rolls stuffed with glass noodles, vegetables, and seasoned pork. Served with sweet chili sauce.', 150, 'https://images.unsplash.com/photo-1606502973842-f64bc2785fe5?w=600&q=80', true, 4),
    (v_main, v_style_id, 'Tonkotsu Ramen', 'Rich and creamy pork bone broth, topped with chashu pork, soft-boiled egg, nori, bamboo shoots, and green onions.', 380, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80', true, 1),
    (v_main, v_style_id, 'Chicken Teriyaki Bowl', 'Grilled chicken glazed with housemade teriyaki sauce, served over steamed Japanese rice with sesame seeds.', 320, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', true, 2),
    (v_main, v_style_id, 'Pad Thai', 'Stir-fried rice noodles with shrimp, bean sprouts, green onions, and crushed peanuts in a tangy tamarind sauce.', 350, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80', true, 3),
    (v_main, v_style_id, 'Beef Bulgogi', 'Korean-style marinated beef with sesame oil, soy, ginger, and garlic. Served with steamed rice and kimchi.', 420, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80', true, 4),
    (v_main, v_style_id, 'Green Curry', 'Authentic Thai green curry with chicken, eggplant, and kaffir lime leaves in rich coconut milk. Served with jasmine rice.', 360, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80', true, 5),
    (v_main, v_style_id, 'Salmon Sashimi Set', 'Premium fresh salmon sashimi (8 pcs) served with wasabi, pickled ginger, and soy sauce.', 480, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80', false, 6),
    (v_desserts, v_style_id, 'Mochi Ice Cream (3 pcs)', 'Soft and chewy Japanese rice cake wrapped around creamy ice cream. Choice of: matcha, strawberry, or mango.', 180, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80', true, 1),
    (v_desserts, v_style_id, 'Matcha Lava Cake', 'Warm matcha chocolate cake with a molten green tea center, served with vanilla ice cream.', 220, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80', true, 2),
    (v_desserts, v_style_id, 'Mango Sticky Rice', 'Classic Thai dessert with ripe mango slices on warm glutinous rice drizzled with sweet coconut cream.', 195, 'https://images.unsplash.com/photo-1528826007177-f38517ce2b91?w=600&q=80', true, 3),
    (v_desserts, v_style_id, 'Taho-Style Silken Tofu', 'Soft silken tofu with brown sugar syrup and sago pearls — our Filipino-Asian fusion dessert.', 120, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', true, 4),
    (v_drinks, v_style_id, 'Matcha Latte', 'Premium ceremonial grade matcha with steamed milk and a hint of honey. Hot or iced.', 160, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80', true, 1),
    (v_drinks, v_style_id, 'Iced Hojicha', 'Roasted Japanese green tea served over ice — nutty, smooth, and lightly smoky.', 140, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', true, 2),
    (v_drinks, v_style_id, 'Thai Iced Milk Tea', 'Strong brewed Thai tea with sweetened condensed milk poured over crushed ice. Rich and refreshing.', 130, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', true, 3),
    (v_drinks, v_style_id, 'Calamansi Soda', 'Fresh-squeezed Philippine calamansi with sparkling water and a touch of honey. Bright and citrusy.', 110, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=80', true, 4),
    (v_drinks, v_style_id, 'Sake (Hot/Cold)', 'Traditional Japanese rice wine. Available hot or cold. Ask staff for available varieties.', 250, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', true, 5);

  -- gallery
  INSERT INTO public.gallery (image_url, caption, sort_order) VALUES
    ('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'A warm evening at Stay Manila Diner', 1),
    ('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', 'Fresh ingredients, every day', 2),
    ('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', 'Our open kitchen', 3),
    ('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 'Intimate dining atmosphere', 4),
    ('https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80', 'Chef''s daily specials', 5),
    ('https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80', 'Sunday brunch spread', 6);
END $$;

-- =====================================================================
-- DONE. Menu, gallery and settings are seeded above.
-- Next: create your admin login user (see MIGRATION_README.md, step 3).
-- =====================================================================
