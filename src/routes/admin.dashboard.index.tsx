import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, EyeOff, ImagePlus, Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/dashboard/")({
  component: QuickActionsDashboard,
});

const ACTIONS = [
  {
    to: "/admin/dashboard/menu",
    search: { add: "1" as const },
    label: "Add a New Dish",
    desc: "Create a new menu item with photo and price.",
    Icon: Plus,
  },
  {
    to: "/admin/dashboard/menu",
    label: "Mark a Dish as Sold Out",
    desc: "Hide a dish from the public menu.",
    Icon: EyeOff,
  },
  {
    to: "/admin/dashboard/gallery",
    label: "Upload a Photo",
    desc: "Add a new photo to the gallery.",
    Icon: ImagePlus,
  },
  {
    to: "/admin/dashboard/settings",
    label: "Update Our Info",
    desc: "Change name, hours, address, or contact.",
    Icon: SettingsIcon,
  },
];

function QuickActionsDashboard() {
  return (
    <div>
      <PageHeader
        title="What do you want to do?"
        subtitle="Pick a quick action below, or use the menu on the left."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTIONS.map(({ to, search, label, desc, Icon }) => (
          <Link
            key={label}
            to={to}
            search={search as any}
            className="group flex items-start gap-4 rounded-xl border border-black/10 bg-white p-5 hover:border-[#C8A96E] hover:bg-black/[0.04] transition"
          >
            <div
              className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent)", color: "#1A1714" }}
            >
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-[#1C1C1E]">{label}</div>
              <p className="text-sm text-black/60 mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
