import { supabase } from "@/integrations/supabase/client";

const SITE_SETTINGS: Record<string, string> = {
  restaurant_name: "Stay Manila Diner",
  tagline: "Lutong Puso, Manila Proud.",
  hero_image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80",
  about_text:
    "A cozy corner where authentic Asian flavors come alive. Every dish is crafted with love, tradition, and the finest ingredients sourced from across the region.",
  address: "123 Food Street, Brgy. Sample, Calamba, Laguna",
  phone: "+63 912 345 6789",
  email: "staymanilahostel@gmail.com",
  hours_weekday: "Monday – Friday: 10:00 AM – 10:00 PM",
  hours_weekend: "Saturday – Sunday: 9:00 AM – 11:00 PM",
  facebook_url: "https://facebook.com",
  instagram_url: "https://instagram.com",
  google_maps_embed: "",
};

const CATEGORIES = [
  { name: "Appetizers", sort_order: 1 },
  { name: "Main Course", sort_order: 2 },
  { name: "Desserts", sort_order: 3 },
  { name: "Drinks", sort_order: 4 },
];

type SeedItem = {
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  sort_order: number;
};

const MENU_ITEMS: SeedItem[] = [
  // Appetizers
  { category: "Appetizers", name: "Gyoza (6 pcs)", description: "Pan-fried Japanese dumplings filled with minced pork and cabbage, served with ponzu dipping sauce.", price: 180, image_url: "https://images.unsplash.com/photo-1599789197514-47270cd526b4?w=600&q=80", is_available: true, sort_order: 1 },
  { category: "Appetizers", name: "Edamame", description: "Lightly salted steamed soybeans — the perfect starter while you wait.", price: 120, image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80", is_available: true, sort_order: 2 },
  { category: "Appetizers", name: "Miso Soup", description: "Traditional Japanese miso broth with silken tofu, wakame seaweed, and green onions.", price: 95, image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80", is_available: true, sort_order: 3 },
  { category: "Appetizers", name: "Spring Rolls (4 pcs)", description: "Crispy fried rolls stuffed with glass noodles, vegetables, and seasoned pork. Served with sweet chili sauce.", price: 150, image_url: "https://images.unsplash.com/photo-1606502973842-f64bc2785fe5?w=600&q=80", is_available: true, sort_order: 4 },
  // Main Course
  { category: "Main Course", name: "Tonkotsu Ramen", description: "Rich and creamy pork bone broth, topped with chashu pork, soft-boiled egg, nori, bamboo shoots, and green onions.", price: 380, image_url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80", is_available: true, sort_order: 1 },
  { category: "Main Course", name: "Chicken Teriyaki Bowl", description: "Grilled chicken glazed with housemade teriyaki sauce, served over steamed Japanese rice with sesame seeds.", price: 320, image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80", is_available: true, sort_order: 2 },
  { category: "Main Course", name: "Pad Thai", description: "Stir-fried rice noodles with shrimp, bean sprouts, green onions, and crushed peanuts in a tangy tamarind sauce.", price: 350, image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80", is_available: true, sort_order: 3 },
  { category: "Main Course", name: "Beef Bulgogi", description: "Korean-style marinated beef with sesame oil, soy, ginger, and garlic. Served with steamed rice and kimchi.", price: 420, image_url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80", is_available: true, sort_order: 4 },
  { category: "Main Course", name: "Green Curry", description: "Authentic Thai green curry with chicken, eggplant, and kaffir lime leaves in rich coconut milk. Served with jasmine rice.", price: 360, image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80", is_available: true, sort_order: 5 },
  { category: "Main Course", name: "Salmon Sashimi Set", description: "Premium fresh salmon sashimi (8 pcs) served with wasabi, pickled ginger, and soy sauce.", price: 480, image_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80", is_available: false, sort_order: 6 },
  // Desserts
  { category: "Desserts", name: "Mochi Ice Cream (3 pcs)", description: "Soft and chewy Japanese rice cake wrapped around creamy ice cream. Choice of: matcha, strawberry, or mango.", price: 180, image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80", is_available: true, sort_order: 1 },
  { category: "Desserts", name: "Matcha Lava Cake", description: "Warm matcha chocolate cake with a molten green tea center, served with vanilla ice cream.", price: 220, image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80", is_available: true, sort_order: 2 },
  { category: "Desserts", name: "Mango Sticky Rice", description: "Classic Thai dessert with ripe mango slices on warm glutinous rice drizzled with sweet coconut cream.", price: 195, image_url: "https://images.unsplash.com/photo-1528826007177-f38517ce2b91?w=600&q=80", is_available: true, sort_order: 3 },
  { category: "Desserts", name: "Taho-Style Silken Tofu", description: "Soft silken tofu with brown sugar syrup and sago pearls — our Filipino-Asian fusion dessert.", price: 120, image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80", is_available: true, sort_order: 4 },
  // Drinks
  { category: "Drinks", name: "Matcha Latte", description: "Premium ceremonial grade matcha with steamed milk and a hint of honey. Hot or iced.", price: 160, image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80", is_available: true, sort_order: 1 },
  { category: "Drinks", name: "Iced Hojicha", description: "Roasted Japanese green tea served over ice — nutty, smooth, and lightly smoky.", price: 140, image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80", is_available: true, sort_order: 2 },
  { category: "Drinks", name: "Thai Iced Milk Tea", description: "Strong brewed Thai tea with sweetened condensed milk poured over crushed ice. Rich and refreshing.", price: 130, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", is_available: true, sort_order: 3 },
  { category: "Drinks", name: "Calamansi Soda", description: "Fresh-squeezed Philippine calamansi with sparkling water and a touch of honey. Bright and citrusy.", price: 110, image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=80", is_available: true, sort_order: 4 },
  { category: "Drinks", name: "Sake (Hot/Cold)", description: "Traditional Japanese rice wine. Available hot or cold. Ask staff for available varieties.", price: 250, image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80", is_available: true, sort_order: 5 },
];

const GALLERY = [
  { image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", caption: "A warm evening at Stay Manila Diner", sort_order: 1 },
  { image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", caption: "Fresh ingredients, every day", sort_order: 2 },
  { image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", caption: "Our open kitchen", sort_order: 3 },
  { image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", caption: "Intimate dining atmosphere", sort_order: 4 },
  { image_url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80", caption: "Chef's daily specials", sort_order: 5 },
  { image_url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80", caption: "Sunday brunch spread", sort_order: 6 },
];

let seedPromise: Promise<void> | null = null;

const BRAND = {
  restaurant_name: "Stay Manila Diner",
  tagline: "Lutong Puso, Manila Proud.",
};

let brandSyncDone = false;
export async function syncBrand(): Promise<void> {
  if (brandSyncDone) return;
  brandSyncDone = true;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["restaurant_name", "tagline"]);
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => (map[r.key] = r.value ?? ""));
    const fixes: { key: string; value: string }[] = [];
    if (!map.restaurant_name || /umami/i.test(map.restaurant_name)) {
      fixes.push({ key: "restaurant_name", value: BRAND.restaurant_name });
    }
    if (!map.tagline || /where every flavor/i.test(map.tagline)) {
      fixes.push({ key: "tagline", value: BRAND.tagline });
    }
    if (fixes.length) {
      await supabase.from("site_settings").upsert(fixes, { onConflict: "key" });
    }
  } catch (e) {
    console.warn("Brand sync skipped:", e);
  }
}

export function seedDatabase(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const { count, error: countErr } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true });
      if (countErr) {
        console.error("Seed check failed:", countErr);
        return;
      }
      if ((count ?? 0) > 0) return;

      // site_settings
      const settingsRows = Object.entries(SITE_SETTINGS).map(([key, value]) => ({ key, value }));
      const { error: sErr } = await supabase
        .from("site_settings")
        .upsert(settingsRows, { onConflict: "key" });
      if (sErr) console.error("site_settings seed error:", sErr);

      // categories
      const { data: catData, error: cErr } = await supabase
        .from("categories")
        .insert(CATEGORIES)
        .select();
      if (cErr || !catData) {
        console.error("categories seed error:", cErr);
        return;
      }
      const catMap = new Map(catData.map((c: any) => [c.name, c.id as string]));

      // menu_items
      const itemRows = MENU_ITEMS.map((i) => ({
        category_id: catMap.get(i.category) ?? null,
        name: i.name,
        description: i.description,
        price: i.price,
        image_url: i.image_url,
        is_available: i.is_available,
        sort_order: i.sort_order,
      }));
      const { error: iErr } = await supabase.from("menu_items").insert(itemRows);
      if (iErr) console.error("menu_items seed error:", iErr);

      // gallery
      const { error: gErr } = await supabase.from("gallery").insert(GALLERY);
      if (gErr) console.error("gallery seed error:", gErr);

      console.log("Seed complete");
    } catch (e) {
      console.error("Seed failed:", e);
    }
  })();
  return seedPromise;
}