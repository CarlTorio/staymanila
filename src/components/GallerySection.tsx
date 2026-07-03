import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type GalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

const INITIAL_VISIBLE = 6;

export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("sort_order");
      setItems((data ?? []) as GalleryItem[]);
      setLoading(false);
    })();
  }, []);

  const close = useCallback(() => setActiveIdx(null), []);
  const next = useCallback(
    () => setActiveIdx((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () =>
      setActiveIdx((i) =>
        i === null ? i : (i - 1 + items.length) % items.length
      ),
    [items.length]
  );

  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIdx, close, next, prev]);

  return (
    <section
      id="gallery"
      className="py-12 md:py-20 relative"
      style={{
        backgroundColor:
          "color-mix(in oklab, var(--color-secondary) 18%, var(--color-background))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-primary)",
            }}
          >
            Gallery
          </h2>
          <p
            className="mt-3 text-sm md:text-base"
            style={{
              color: "color-mix(in oklab, var(--color-text) 60%, transparent)",
            }}
          >
            A glimpse into our world
          </p>
          <div
            className="mx-auto mt-4 h-[2px] w-16 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <p className="text-center py-16 opacity-60">Photos coming soon.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {(expanded ? items : items.slice(0, INITIAL_VISIBLE)).map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveIdx(idx)}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="group relative aspect-square overflow-hidden rounded-xl shadow-md cursor-pointer"
                >
                  <img
                    src={item.image_url}
                    alt={item.caption ?? "Gallery image"}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {item.caption && (
                    <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <p className="text-white text-sm p-4 text-left">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            {items.length > INITIAL_VISIBLE && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--color-accent)",
                    color: "var(--color-primary)",
                    backgroundColor: "var(--color-accent)",
                  }}
                >
                  {expanded ? (
                    <>Show less <ChevronUp size={16} /></>
                  ) : (
                    <>View all {items.length} photos <ChevronDown size={16} /></>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {activeIdx !== null && items[activeIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center"
            >
              ×
            </button>
            {items.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous"
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next"
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}
            <motion.div
              key={items[activeIdx].id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full flex flex-col items-center gap-4"
            >
              <img
                src={items[activeIdx].image_url}
                alt={items[activeIdx].caption ?? ""}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
              />
              {items[activeIdx].caption && (
                <p className="text-white/80 text-center text-sm md:text-base">
                  {items[activeIdx].caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl shimmer" />
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
