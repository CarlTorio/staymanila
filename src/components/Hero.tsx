import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.png";

type HeroSettings = {
  restaurant_name: string;
  tagline: string;
  hero_image_url: string;
};

export function Hero() {
  const [data, setData] = useState<HeroSettings | null>(null);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["restaurant_name", "tagline", "hero_image_url"]);
      const map: Record<string, string> = {};
      (rows ?? []).forEach((r: any) => (map[r.key] = r.value ?? ""));
      setData({
        restaurant_name: map.restaurant_name ?? "",
        tagline: map.tagline ?? "",
        hero_image_url: map.hero_image_url ?? "",
      });
    })();
  }, []);

  const scrollToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const hasImage = !!data?.hero_image_url;

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        minHeight: "85vh",
        height: "100vh",
        background: hasImage
          ? undefined
          : "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
      }}
    >
      {/* Responsive height override via media query */}
      <style>{`
        @media (max-width: 767px) {
          .smd-hero { height: 85vh !important; }
        }
      `}</style>
      <div className="smd-hero absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        {!data ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-16 md:h-24 rounded-md mx-auto w-3/4" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div className="h-6 rounded-md mx-auto w-1/2" style={{ backgroundColor: "rgba(255,255,255,0.10)" }} />
            <div className="h-12 rounded-full mx-auto w-40" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
          </div>
        ) : (
          <>
            <motion.img
              src={logo}
              alt={data.restaurant_name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="mx-auto w-full max-w-[260px] md:max-w-[520px] h-auto drop-shadow-2xl"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="mt-5 font-light"
              style={{
                color: "#22170d",
                fontSize: "clamp(1rem, 2.4vw, 1.375rem)",
              }}
            >
              {data.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
              className="mt-10 px-2 md:px-0"
            >
              <a
                href="#menu-section"
                onClick={scrollToMenu}
                className="inline-block w-full md:w-auto px-10 py-4 rounded-full text-sm font-medium uppercase tracking-[0.18em] transition hover:opacity-90 hover:scale-[1.02] active:scale-100"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-primary)",
                }}
              >
                View Menu
              </a>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
