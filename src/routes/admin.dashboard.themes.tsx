import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  ConfirmDialog,
  Modal,
  PageHeader,
  SkeletonRows,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/dashboard/themes")({
  component: ThemesManager,
});

type Theme = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
};

const blank = {
  name: "",
  slug: "",
  primary_color: "#1a1a1a",
  secondary_color: "#cccccc",
  accent_color: "#c9a84c",
  background_color: "#fafafa",
  text_color: "#1a1a1a",
  heading_font: "Playfair Display",
  body_font: "Inter",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ThemesManager() {
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Theme | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Theme | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("themes").select("*").order("name");
    setThemes((data ?? []) as Theme[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...blank });
    setModalOpen(true);
  };
  const openEdit = (t: Theme) => {
    setEditing(t);
    setForm({
      name: t.name,
      slug: t.slug,
      primary_color: t.primary_color,
      secondary_color: t.secondary_color,
      accent_color: t.accent_color,
      background_color: t.background_color,
      text_color: t.text_color,
      heading_font: t.heading_font,
      body_font: t.body_font,
    });
    setModalOpen(true);
  };

  const activate = async (t: Theme) => {
    setActivating(t.id);
    const a = await supabase
      .from("themes")
      .update({ is_active: false })
      .neq("id", t.id);
    if (a.error) {
      setActivating(null);
      return toast.error(a.error.message);
    }
    const b = await supabase
      .from("themes")
      .update({ is_active: true })
      .eq("id", t.id);
    setActivating(null);
    if (b.error) return toast.error(b.error.message);
    toast.success(`"${t.name}" is now active`);
    load();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    const slug = form.slug.trim() || slugify(form.name);
    setSaving(true);
    const payload = { ...form, slug };
    const { error } = editing
      ? await supabase.from("themes").update(payload).eq("id", editing.id)
      : await supabase.from("themes").insert({ ...payload, is_active: false });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Theme updated" : "Theme created");
    setModalOpen(false);
    load();
  };

  const tryDelete = (t: Theme) => {
    if (t.is_active) return toast.error("Cannot delete the active theme");
    setConfirmDel(t);
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    const { error } = await supabase
      .from("themes")
      .delete()
      .eq("id", confirmDel.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Theme deleted");
    setConfirmDel(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Theme Manager"
        subtitle="Activate a theme and the public site switches instantly."
        action={
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add New Theme
          </AdminButton>
        }
      />

      {loading ? (
        <AdminCard>
          <SkeletonRows />
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((t) => {
            const active = !!t.is_active;
            return (
              <AdminCard
                key={t.id}
                className={`p-5 flex flex-col gap-4 ${
                  active ? "ring-2" : ""
                }`}
                {...(active
                  ? ({ style: { boxShadow: `0 0 0 2px ${t.accent_color}` } } as any)
                  : {})}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[#1C1C1E]">{t.name}</h3>
                    <p className="text-xs text-black/50">{t.slug}</p>
                  </div>
                  {active && (
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold text-black"
                      style={{ backgroundColor: t.accent_color }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {[
                    t.primary_color,
                    t.secondary_color,
                    t.accent_color,
                    t.background_color,
                    t.text_color,
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border border-black/15"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>

                <div className="text-xs text-black/60 space-y-0.5">
                  <div>
                    Heading: <span className="text-[#1C1C1E]/90">{t.heading_font}</span>
                  </div>
                  <div>
                    Body: <span className="text-[#1C1C1E]/90">{t.body_font}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  {!active && (
                    <AdminButton
                      onClick={() => activate(t)}
                      loading={activating === t.id}
                    >
                      <Check size={14} /> Activate
                    </AdminButton>
                  )}
                  <AdminButton
                    variant="outline"
                    onClick={() => openEdit(t)}
                    className="!px-2.5 !py-1.5"
                  >
                    <Pencil size={14} />
                  </AdminButton>
                  {!active && (
                    <AdminButton
                      variant="danger"
                      onClick={() => tryDelete(t)}
                      className="!px-2.5 !py-1.5"
                    >
                      <Trash2 size={14} />
                    </AdminButton>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Theme" : "Add Theme"}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <AdminLabel>Name *</AdminLabel>
              <AdminInput
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: editing ? f.slug : slugify(name),
                  }));
                }}
                required
              />
            </div>
            <div>
              <AdminLabel>Slug</AdminLabel>
              <AdminInput
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(
              [
                ["primary_color", "Primary"],
                ["secondary_color", "Secondary"],
                ["accent_color", "Accent"],
                ["background_color", "Background"],
                ["text_color", "Text"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <AdminLabel>{label}</AdminLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    className="h-9 w-12 rounded border border-black/10 bg-transparent cursor-pointer"
                  />
                  <AdminInput
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <AdminLabel>Heading Font (Google Font name)</AdminLabel>
              <AdminInput
                value={form.heading_font}
                onChange={(e) =>
                  setForm({ ...form, heading_font: e.target.value })
                }
              />
            </div>
            <div>
              <AdminLabel>Body Font (Google Font name)</AdminLabel>
              <AdminInput
                value={form.body_font}
                onChange={(e) =>
                  setForm({ ...form, body_font: e.target.value })
                }
              />
            </div>
          </div>

          {/* Live preview */}
          <div>
            <AdminLabel>Preview</AdminLabel>
            <div
              className="rounded-lg p-6 border border-black/10"
              style={{
                backgroundColor: form.background_color,
                color: form.text_color,
              }}
            >
              <div
                className="text-2xl mb-1"
                style={{
                  fontFamily: form.heading_font,
                  color: form.primary_color,
                }}
              >
                {form.name || "Theme Preview"}
              </div>
              <p className="text-sm opacity-80 mb-4">
                A glimpse of how text and accents appear with this palette.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded font-medium text-[#1C1C1E]"
                style={{ backgroundColor: form.accent_color }}
              >
                Accent Button
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving}>
              Save
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        onCancel={() => setConfirmDel(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete theme?"
        message={`This will delete "${confirmDel?.name}".`}
      />
    </div>
  );
}
