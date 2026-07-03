import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { GallerySection } from "@/components/GallerySection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ScrollProgress, BackToTop, Reveal } from "@/components/SiteChrome";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: PublicSite,
  head: () => ({
    meta: [
      { title: "Stay Manila Diner — Lutong Puso, Manila Proud." },
      { name: "description", content: "Classic Filipino comfort food served with heart at Stay Manila Diner." },
    ],
  }),
});

type MenuItem = {
  id: string; name: string; description: string | null; price: number;
  image_url: string | null; is_available: boolean; sort_order: number;
  category_id: string | null;
};
type Category = { id: string; name: string; sort_order: number };
type GalleryItem = { id: string; image_url: string; caption: string | null };

function PublicSite() {
  const navigate = useNavigate();
  const lastLogoClick = useRef(0);
  const { theme, loading } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    (async () => {
      const [s, c, i, g] = await Promise.all([
        supabase.from("site_settings").select("*"),
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").eq("is_available", true).order("sort_order"),
        supabase.from("gallery").select("*").order("sort_order"),
      ]);
      if (s.data) {
        const map: Record<string, string> = {};
        s.data.forEach((r: any) => (map[r.key] = r.value ?? ""));
        setSettings(map);
      }
      if (c.data) setCategories(c.data as Category[]);
      if (i.data) setItems(i.data as MenuItem[]);
      if (g.data) setGallery(g.data as GalleryItem[]);
    })();
  }, [theme?.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  const name = settings.restaurant_name || "Stay Manila Diner";
  const tagline = settings.tagline || "";

  return (
    <div style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <ScrollProgress />
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: "color-mix(in oklab, var(--color-background) 80%, transparent)", borderColor: "color-mix(in oklab, var(--color-text) 10%, transparent)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="#top"
            className="flex items-center select-none"
            aria-label={name}
            onClick={(e) => {
              const now = Date.now();
              if (now - lastLogoClick.current < 400) {
                e.preventDefault();
                lastLogoClick.current = 0;
                navigate({ to: "/admin/login" });
                return;
              }
              lastLogoClick.current = now;
            }}
          >
            <img src={logo} alt={name} className="h-10 md:h-12 w-auto" draggable={false} />
          </a>
          <div className="hidden md:flex gap-8 text-sm">
            <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
            <a href="#menu-section" className="hover:opacity-70 transition-opacity">Menu</a>
            <a href="#gallery" className="hover:opacity-70 transition-opacity">Gallery</a>
            <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
          </div>
          <button
            type="button"
            className="md:hidden p-1.5 -mr-1.5"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{ color: "var(--color-text)" }}
          >
            {menuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: "color-mix(in oklab, var(--color-text) 10%, transparent)" }}
            >
              <div className="flex flex-col px-6 py-2 text-sm">
                {[
                  { href: "#about", label: "About" },
                  { href: "#menu-section", label: "Menu" },
                  { href: "#gallery", label: "Gallery" },
                  { href: "#contact", label: "Contact" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-3 border-b last:border-b-0 hover:opacity-70 transition-opacity"
                    style={{ borderColor: "color-mix(in oklab, var(--color-text) 8%, transparent)" }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <Hero />

      <Reveal><MenuSection /></Reveal>
      <Reveal><GallerySection /></Reveal>
      <Reveal><ContactSection settings={settings} /></Reveal>

      <Footer name={name} tagline={tagline} />
      <BackToTop />
    </div>
  );
}
