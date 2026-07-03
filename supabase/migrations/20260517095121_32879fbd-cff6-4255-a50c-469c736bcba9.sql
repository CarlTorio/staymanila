
-- 1. Restaurant styles (e.g. Filipino, Thai, Japanese)
CREATE TABLE public.restaurant_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurant_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read restaurant_styles" ON public.restaurant_styles FOR SELECT USING (true);
CREATE POLICY "anon write restaurant_styles" ON public.restaurant_styles FOR ALL USING (true) WITH CHECK (true);

-- 2. Weekly schedule: which style is active on which weekday (0=Sun..6=Sat)
CREATE TABLE public.style_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id uuid NOT NULL REFERENCES public.restaurant_styles(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day_of_week)
);
ALTER TABLE public.style_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read style_schedules" ON public.style_schedules FOR SELECT USING (true);
CREATE POLICY "anon write style_schedules" ON public.style_schedules FOR ALL USING (true) WITH CHECK (true);

-- 3. Link categories and menu items to a style
ALTER TABLE public.categories ADD COLUMN style_id uuid REFERENCES public.restaurant_styles(id) ON DELETE CASCADE;
ALTER TABLE public.menu_items ADD COLUMN style_id uuid REFERENCES public.restaurant_styles(id) ON DELETE CASCADE;
CREATE INDEX idx_categories_style ON public.categories(style_id);
CREATE INDEX idx_menu_items_style ON public.menu_items(style_id);

-- 4. Backfill: create a default "House Menu" style and assign existing rows
DO $$
DECLARE
  v_style_id uuid;
BEGIN
  INSERT INTO public.restaurant_styles (name, slug, description, is_default, sort_order)
  VALUES ('House Menu', 'house-menu', 'Default menu', true, 0)
  RETURNING id INTO v_style_id;

  UPDATE public.categories SET style_id = v_style_id WHERE style_id IS NULL;
  UPDATE public.menu_items SET style_id = v_style_id WHERE style_id IS NULL;
END $$;
