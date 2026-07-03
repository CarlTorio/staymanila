import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Theme = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  background_texture: string | null;
};

type ThemeContextValue = {
  theme: Theme | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  loading: true,
  refresh: async () => {},
});

const loadedFonts = new Set<string>();
function loadGoogleFont(family: string) {
  if (!family || loadedFonts.has(family) || typeof document === "undefined") return;
  loadedFonts.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const r = document.documentElement.style;
  r.setProperty("--color-primary", theme.primary_color);
  r.setProperty("--color-secondary", theme.secondary_color);
  r.setProperty("--color-accent", theme.accent_color);
  r.setProperty("--color-background", theme.background_color);
  r.setProperty("--color-text", theme.text_color);
  r.setProperty("--font-heading", `'${theme.heading_font}', serif`);
  r.setProperty("--font-body", `'${theme.body_font}', sans-serif`);
  loadGoogleFont(theme.heading_font);
  loadGoogleFont(theme.body_font);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("themes")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();
    if (data) {
      setTheme(data as Theme);
      applyTheme(data as Theme);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, refresh: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
