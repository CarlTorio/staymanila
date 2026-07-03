import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
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

export const Route = createFileRoute("/admin/dashboard/categories")({
  component: CategoriesPage,
});

type Style = { id: string; name: string; is_default: boolean; sort_order: number };
type Category = {
  id: string;
  name: string;
  sort_order: number;
  style_id: string | null;
};

function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [styles, setStyles] = useState<Style[]>([]);
  const [styleId, setStyleId] = useState<string>("");
  const [allCats, setAllCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [confirmDel, setConfirmDel] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cats = useMemo(
    () => allCats.filter((c) => c.style_id === styleId),
    [allCats, styleId]
  );

  const load = async () => {
    setLoading(true);
    const [st, c, m] = await Promise.all([
      supabase.from("restaurant_styles").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("category_id"),
    ]);
    const list = (st.data ?? []) as Style[];
    setStyles(list);
    setAllCats((c.data ?? []) as Category[]);
    const map: Record<string, number> = {};
    ((m.data ?? []) as { category_id: string | null }[]).forEach((r) => {
      if (r.category_id) map[r.category_id] = (map[r.category_id] ?? 0) + 1;
    });
    setCounts(map);
    setStyleId((prev) => {
      if (prev && list.some((s) => s.id === prev)) return prev;
      const def = list.find((s) => s.is_default) ?? list[0];
      return def?.id ?? "";
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cats.length) return;
    const a = cats[idx];
    const b = cats[target];
    const res = await Promise.all([
      supabase
        .from("categories")
        .update({ sort_order: b.sort_order })
        .eq("id", a.id),
      supabase
        .from("categories")
        .update({ sort_order: a.sort_order })
        .eq("id", b.id),
    ]);
    if (res.some((r) => r.error)) toast.error("Reorder failed");
    load();
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (!styleId) return toast.error("Pick a cuisine style first");
    setSaving(true);
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      sort_order: cats.length,
      style_id: styleId,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Section added");
    setNewName("");
    setAddOpen(false);
    load();
  };

  const saveRename = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editingName.trim() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    setEditingId(null);
    load();
  };

  const tryDelete = (c: Category) => {
    if ((counts[c.id] ?? 0) > 0) {
      toast.error(
        `Cannot delete "${c.name}" — ${counts[c.id]} dish(es) still use it.`
      );
      return;
    }
    setConfirmDel(c);
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", confirmDel.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Section deleted");
    setConfirmDel(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Menu Sections"
        subtitle="Each cuisine style has its own sections (e.g. Appetizers, Mains, Desserts). Pick a style below to manage its sections."
        action={
          <AdminButton onClick={() => setAddOpen(true)} disabled={!styleId}>
            <Plus size={16} /> Add Section
          </AdminButton>
        }
      />

      <AdminCard className="p-4 mb-4">
        <AdminLabel>Cuisine Style</AdminLabel>
        {styles.length === 0 ? (
          <p className="text-sm text-black/60">
            No cuisine styles yet. Create one under Cuisine Styles first.
          </p>
        ) : (
          <select
            value={styleId}
            onChange={(e) => setStyleId(e.target.value)}
            className="w-full md:w-72 px-3 py-2 rounded-md bg-black/5 border border-black/10 text-[#1C1C1E] outline-none focus:border-[#C8A96E]"
          >
            {styles.map((s) => (
              <option key={s.id} value={s.id} className="bg-white">
                {s.name}
              </option>
            ))}
          </select>
        )}
      </AdminCard>

      <AdminCard>
        {loading ? (
          <SkeletonRows />
        ) : cats.length === 0 ? (
          <p className="text-center text-black/50 py-12">
            No sections in this style yet.
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {cats.map((c, idx) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03]"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="text-black/50 hover:text-[#1C1C1E] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === cats.length - 1}
                    className="text-black/50 hover:text-[#1C1C1E] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === c.id ? (
                    <div className="flex items-center gap-2">
                      <AdminInput
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(c.id)}
                        className="p-1.5 rounded text-green-400 hover:bg-black/5"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded text-black/60 hover:bg-black/5"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-black/50">
                        {counts[c.id] ?? 0} dish(es)
                      </span>
                    </div>
                  )}
                </div>

                {editingId !== c.id && (
                  <div className="flex gap-2">
                    <AdminButton
                      variant="outline"
                      className="!px-2.5 !py-1.5"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditingName(c.name);
                      }}
                    >
                      <Pencil size={14} />
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      className="!px-2.5 !py-1.5"
                      onClick={() => tryDelete(c)}
                    >
                      <Trash2 size={14} />
                    </AdminButton>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Section"
      >
        <form onSubmit={addCategory} className="space-y-4">
          <div>
            <AdminLabel>Name</AdminLabel>
            <AdminInput
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Appetizers, Mains, Desserts"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving}>
              Add
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        onCancel={() => setConfirmDel(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete section?"
        message={`This will delete "${confirmDel?.name}".`}
      />
    </div>
  );
}
