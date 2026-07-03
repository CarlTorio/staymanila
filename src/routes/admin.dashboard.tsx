import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthed, adminLogout } from "@/lib/admin-auth";
import {
  UtensilsCrossed,
  FolderOpen,
  Images,
  Palette,
  Globe2,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardLayout,
});

const NAV = [
  { to: "/admin/dashboard/styles", label: "Cuisine Styles", icon: Globe2 },
  { to: "/admin/dashboard/categories", label: "Menu Sections", icon: FolderOpen },
  { to: "/admin/dashboard/menu", label: "Dishes", icon: UtensilsCrossed },
  { to: "/admin/dashboard/gallery", label: "Photos", icon: Images },
  { to: "/admin/dashboard/themes", label: "Visual Theme", icon: Palette },
  { to: "/admin/dashboard/settings", label: "Restaurant Info", icon: SettingsIcon },
] as const;

function DashboardLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [restaurantName, setRestaurantName] = useState("Stay Manila Diner");
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let active = true;
    isAdminAuthed().then((authed) => {
      if (!active) return;
      if (!authed) {
        navigate({ to: "/admin/login" });
        return;
      }
      setReady(true);
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "restaurant_name")
        .maybeSingle()
        .then(({ data }) => {
          if (data?.value) setRestaurantName(data.value);
        });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready) return null;

  const logout = async () => {
    await adminLogout();
    navigate({ to: "/admin/login" });
  };

  return (
    <div
      className="min-h-screen flex bg-[var(--color-background)] text-[var(--color-text)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-[var(--color-accent)]/20 transform transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div
              className="text-lg leading-tight"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-accent)",
              }}
            >
              {restaurantName}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              Admin
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                style={
                  active
                    ? { backgroundColor: "var(--color-accent)", color: "#fff" }
                    : undefined
                }
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={16} />
            View site
          </Link>
        </div>
      </aside>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-[var(--color-background)]/90 backdrop-blur border-b border-black/10 px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden text-black/70 hover:text-[#1C1C1E]"
              aria-label="Open menu"
            >
              <MenuIcon size={22} />
            </button>
            <h1
              className="text-base font-medium truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {restaurantName}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-black/15 hover:bg-black/5"
          >
            <LogOut size={14} />
            Logout
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
