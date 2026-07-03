import { supabase } from "@/integrations/supabase/client";

export type RestaurantStyle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  sort_order: number;
};

// Returns the style that should be active today, or the default style as fallback.
// Day of week: 0=Sun..6=Sat to match JS Date.getDay()
export async function fetchActiveStyle(): Promise<RestaurantStyle | null> {
  const today = new Date().getDay();

  const { data: sched } = await supabase
    .from("style_schedules")
    .select("style_id")
    .eq("day_of_week", today)
    .maybeSingle();

  if (sched?.style_id) {
    const { data } = await supabase
      .from("restaurant_styles")
      .select("*")
      .eq("id", sched.style_id)
      .maybeSingle();
    if (data) return data as RestaurantStyle;
  }

  const { data: def } = await supabase
    .from("restaurant_styles")
    .select("*")
    .eq("is_default", true)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (def) return def as RestaurantStyle;

  // Fallback: any style
  const { data: any } = await supabase
    .from("restaurant_styles")
    .select("*")
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  return (any as RestaurantStyle) ?? null;
}
