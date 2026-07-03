import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminTextarea,
  ConfirmDialog,
  Modal,
  PageHeader,
  SkeletonRows,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/dashboard/styles")({
  component: StylesPage,
});

type Style = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  sort_order: number;
};
type Schedule = { id: string; style_id: string; day_of_week: number };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `style-${Date.now()}`;

function StylesPage() {
  const [loading, setLoading] = useState(true);
  const [styles, setStyles] = useState<Style[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Style | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const [confirmDel, setConfirmDel] = useState<Style | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, sc] = await Promise.all([
      supabase.from("restaurant_styles").select("*").order("sort_order"),
      supabase.from("style_schedules").select("*"),
    ]);
    setStyles((s.data ?? []) as Style[]);
    setSchedules((sc.data ?? []) as Schedule[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (s: Style) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description ?? "" });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      slug: editing ? editing.slug : slugify(form.name),
      sort_order: editing ? editing.sort_order : styles.length,
    };
    const { error } = editing
      ? await supabase
          .from("restaurant_styles")
          .update(payload)
          .eq("id", editing.id)
      : await supabase.from("restaurant_styles").insert({
          ...payload,
          is_default: styles.length === 0,
        });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Style updated" : "Style added");
    setModalOpen(false);
    load();
  };

  const makeDefault = async (s: Style) => {
    const r1 = await supabase
      .from("restaurant_styles")
      .update({ is_default: false })
      .neq("id", s.id);
    if (r1.error) return toast.error(r1.error.message);
    const r2 = await supabase
      .from("restaurant_styles")
      .update({ is_default: true })
      .eq("id", s.id);
    if (r2.error) return toast.error(r2.error.message);
    toast.success(`${s.name} is now the default style`);
    load();
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    const { error } = await supabase
      .from("restaurant_styles")
      .delete()
      .eq("id", confirmDel.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Style deleted (its sections and dishes were removed too)");
    setConfirmDel(null);
    load();
  };

  const setDay = async (day: number, styleId: string | "") => {
    // Upsert/delete schedule for that day (UNIQUE on day_of_week)
    const existing = schedules.find((s) => s.day_of_week === day);
    if (!styleId) {
      if (!existing) return;
      const { error } = await supabase
        .from("style_schedules")
        .delete()
        .eq("id", existing.id);
      if (error) return toast.error(error.message);
      setSchedules((prev) => prev.filter((s) => s.id !== existing.id));
      return;
    }
    if (existing) {
      const { error } = await supabase
        .from("style_schedules")
        .update({ style_id: styleId })
        .eq("id", existing.id);
      if (error) return toast.error(error.message);
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === existing.id ? { ...s, style_id: styleId } : s
        )
      );
    } else {
      const { data, error } = await supabase
        .from("style_schedules")
        .insert({ style_id: styleId, day_of_week: day })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setSchedules((prev) => [...prev, data as Schedule]);
    }
  };

  return (
    <div>
      <PageHeader
        title="Restaurant Styles"
        subtitle="Create cuisines or themes (e.g. Filipino, Thai, Japanese). Each style has its own menu sections and dishes. Use the weekly schedule below to switch styles automatically by day."
        action={
          <AdminButton onClick={openAdd}>
            <Plus size={16} /> Add Style
          </AdminButton>
        }
      />

      <AdminCard className="mb-6">
        {loading ? (
          <SkeletonRows />
        ) : styles.length === 0 ? (
          <p className="text-center text-black/50 py-12">
            No styles yet. Add one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {styles.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300 bg-amber-300/10 px-2 py-0.5 rounded-full">
                        <Star size={10} /> Default
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-black/50 mt-0.5 line-clamp-1">
                      {s.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!s.is_default && (
                    <AdminButton
                      variant="outline"
                      className="!px-2.5 !py-1.5"
                      onClick={() => makeDefault(s)}
                      title="Make default (used when no schedule matches)"
                    >
                      <Star size={14} />
                    </AdminButton>
                  )}
                  <AdminButton
                    variant="outline"
                    className="!px-2.5 !py-1.5"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil size={14} />
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    className="!px-2.5 !py-1.5"
                    onClick={() => setConfirmDel(s)}
                  >
                    <Trash2 size={14} />
                  </AdminButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <PageHeader
        title="Weekly Schedule"
        subtitle="Pick which style is active each day of the week. Days left blank fall back to the default style."
      />
      <AdminCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DAYS.map((d, i) => {
            const sel = schedules.find((s) => s.day_of_week === i);
            return (
              <div key={i}>
                <AdminLabel>{d}</AdminLabel>
                <select
                  value={sel?.style_id ?? ""}
                  onChange={(e) => setDay(i, e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-black/5 border border-black/10 text-[#1C1C1E] outline-none focus:border-[#C8A96E]"
                >
                  <option value="">— Use default —</option>
                  {styles.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </AdminCard>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Style" : "Add Style"}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <AdminLabel>Name *</AdminLabel>
            <AdminInput
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Filipino, Thai, Japanese"
              required
            />
          </div>
          <div>
            <AdminLabel>Description</AdminLabel>
            <AdminTextarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description for this cuisine or theme"
            />
          </div>
          <div className="flex justify-end gap-2">
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
        title="Delete this style?"
        message={`"${confirmDel?.name}" and all its menu sections and dishes will be permanently removed.`}
      />
    </div>
  );
}
