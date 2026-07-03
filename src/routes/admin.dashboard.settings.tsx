import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/storage";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminTextarea,
  PageHeader,
  SkeletonRows,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/dashboard/settings")({
  component: SiteSettingsPage,
});

const FIELDS: { key: string; label: string; type: "text" | "textarea" | "image" }[] = [
  { key: "restaurant_name", label: "Restaurant Name", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "hero_image_url", label: "Hero Image", type: "image" },
  { key: "about_text", label: "About Text", type: "textarea" },
  { key: "address", label: "Address", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "hours_weekday", label: "Weekday Hours", type: "text" },
  { key: "hours_weekend", label: "Weekend Hours", type: "text" },
  { key: "facebook_url", label: "Facebook URL", type: "text" },
  { key: "instagram_url", label: "Instagram URL", type: "text" },
  { key: "google_maps_embed", label: "Google Maps Embed URL", type: "textarea" },
];

function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    ((data ?? []) as { key: string; value: string | null }[]).forEach((r) => {
      map[r.key] = r.value ?? "";
    });
    setValues(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onHero = async (file: File) => {
    setUploadingHero(true);
    try {
      const url = await uploadImage(file, "hero");
      setValues((v) => ({ ...v, hero_image_url: url }));
      toast.success("Hero image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingHero(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const rows = FIELDS.map((f) => ({
      key: f.key,
      value: values[f.key] ?? "",
    }));
    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
      return;
    }
    toast.success("Settings saved!");
  };

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Update your public site content. Saved instantly to the database."
      />

      {loading ? (
        <AdminCard>
          <SkeletonRows count={8} />
        </AdminCard>
      ) : (
        <form onSubmit={save}>
          <AdminCard className="p-6 space-y-5">
            {FIELDS.map((f) => {
              if (f.type === "image") {
                return (
                  <div key={f.key}>
                    <AdminLabel>{f.label}</AdminLabel>
                    <label
                      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black/15 rounded-lg p-6 cursor-pointer hover:bg-black/[0.03]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) onHero(file);
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onHero(file);
                        }}
                      />
                      <Upload size={20} className="text-black/50" />
                      <span className="text-sm text-black/60">
                        {uploadingHero
                          ? "Uploading…"
                          : "Drag image here or click to upload"}
                      </span>
                    </label>
                    {values[f.key] && (
                      <img
                        src={values[f.key]}
                        alt="hero"
                        className="mt-3 max-h-48 w-full object-cover rounded-md"
                      />
                    )}
                  </div>
                );
              }
              if (f.type === "textarea") {
                return (
                  <div key={f.key}>
                    <AdminLabel>{f.label}</AdminLabel>
                    <AdminTextarea
                      rows={4}
                      value={values[f.key] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [f.key]: e.target.value }))
                      }
                    />
                  </div>
                );
              }
              return (
                <div key={f.key}>
                  <AdminLabel>{f.label}</AdminLabel>
                  <AdminInput
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                </div>
              );
            })}
          </AdminCard>

          <div className="flex justify-end mt-6">
            <AdminButton type="submit" loading={saving}>
              Save All Settings
            </AdminButton>
          </div>
        </form>
      )}
    </div>
  );
}
