import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveStyle, type RestaurantStyle } from "@/lib/active-style";

type Category = { id: string; name: string; sort_order: number; style_id: string | null };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  category_id: string | null;
  style_id: string | null;
};

export function MenuSection() {
  const [style, setStyle] = useState<RestaurantStyle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const activeStyle = await fetchActiveStyle();
        setStyle(activeStyle);
        if (!activeStyle) {
          setLoading(false);
          return;
        }
        const [c, i] = await Promise.all([
          supabase
            .from("categories")
            .select("*")
            .eq("style_id", activeStyle.id)
            .order("sort_order"),
          supabase
            .from("menu_items")
            .select("*")
            .eq("style_id", activeStyle.id)
            .eq("is_available", true)
            .order("category_id")
            .order("sort_order"),
        ]);
        if (c.error || i.error) throw c.error || i.error;
        const cats = (c.data ?? []) as Category[];
        setCategories(cats);
        setItems((i.data ?? []) as MenuItem[]);
        if (cats.length) setActiveId(cats[0].id);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = items.filter((it) => it.category_id === activeId);

  return (
    <section
      id="menu-section"
      className="pt-2 pb-12 md:pt-4 md:pb-20"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          {style && (
            <div
              className="inline-block text-[11px] uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full"
              style={{
                color: "var(--color-accent)",
                backgroundColor:
                  "color-mix(in oklab, var(--color-accent) 12%, transparent)",
              }}
            >
              Today's Menu · {style.name}
            </div>
          )}
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-primary)",
            }}
          >
            Our Menu
          </h2>
          {style?.description && (
            <p className="mt-3 max-w-xl mx-auto text-sm md:text-base opacity-70">
              {style.description}
            </p>
          )}
          <div
            className="mx-auto mt-4 h-[2px] w-16 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        </div>

        {error ? (
          <p className="text-center py-16 opacity-70">
            Menu unavailable right now. Please check back soon.
          </p>
        ) : loading ? (
          <SkeletonGrid />
        ) : categories.length === 0 ? (
          <p className="text-center opacity-60">Menu coming soon.</p>
        ) : (
          <>
            {/* Tabs */}
            <div
              className="flex flex-wrap justify-center gap-3 pb-3 mb-8 px-6 scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((cat) => {
                const active = cat.id === activeId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveId(cat.id)}
                    className="whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border"
                    style={{
                      backgroundColor: active
                        ? "var(--color-accent)"
                        : "transparent",
                      color: active ? "#ffffff" : "var(--color-primary)",
                      borderColor: "var(--color-accent)",
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
              >
                {visible.length === 0 ? (
                  <p className="col-span-full text-center opacity-60 py-10">
                    No items in this category yet.
                  </p>
                ) : (
                  visible.map((item) => <MenuCard key={item.id} item={item} />)
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden shadow-md flex flex-col"
      style={{
        backgroundColor:
          "color-mix(in oklab, var(--color-background) 92%, var(--color-secondary))",
      }}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 25%, transparent), color-mix(in oklab, var(--color-accent) 8%, transparent))",
              color: "var(--color-accent)",
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
            }}
          >
            {item.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-3 md:p-5 flex-1 flex flex-col gap-2">
        <h3
          className="font-bold text-base md:text-lg leading-tight"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-primary)",
          }}
        >
          {item.name}
        </h3>
        <span
          className="font-bold text-lg md:text-xl whitespace-nowrap"
          style={{ color: "var(--color-accent)" }}
        >
          ₱{Number(item.price).toFixed(2)}
        </span>
        {item.description && (
          <p
            className="text-xs md:text-sm leading-snug overflow-hidden"
            style={{
              color: "color-mix(in oklab, var(--color-text) 65%, transparent)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.description}
          </p>
        )}
      </div>
    </motion.article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden shadow-md"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-background) 92%, var(--color-secondary))",
          }}
        >
          <div className="aspect-[4/3] w-full shimmer" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 shimmer rounded" />
            <div className="h-3 w-full shimmer rounded" />
            <div className="h-3 w-2/3 shimmer rounded" />
          </div>
        </div>
      ))}
      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            color-mix(in oklab, var(--color-text) 8%, transparent) 0%,
            color-mix(in oklab, var(--color-text) 16%, transparent) 50%,
            color-mix(in oklab, var(--color-text) 8%, transparent) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
