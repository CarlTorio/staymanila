import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/storage";
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
  Toggle,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/dashboard/menu")({
  component: MenuManager,
  validateSearch: (s: Record<string, unknown>) => ({
    add: s.add === "1" || s.add === 1 ? ("1" as const) : undefined,
  }),
});

type Style = { id: string; name: string; is_default: boolean; sort_order: number };
type Category = { id: string; name: string; style_id: string | null };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  category_id: string | null;
  style_id: string | null;
};

const blank = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  is_available: true,
  category_id: "",
};

function MenuManager() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [loading, setLoading] = useState(true);
  const [styles, setStyles] = useState<Style[]>([]);
  const [styleId, setStyleId] = useState<string>("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [confirmDel, setConfirmDel] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const scopedCats = useMemo(
    () => categories.filter((c) => c.style_id === styleId),
    [categories, styleId]
  );
  const scopedItems = useMemo(
    () => items.filter((it) => it.style_id === styleId),
    [items, styleId]
  );

  const load = async () => {
    setLoading(true);
    const [st, i, c] = await Promise.all([
      supabase.from("restaurant_styles").select("*").order("sort_order"),
      supabase
        .from("menu_items")
        .select("*")
        .order("category_id")
        .order("sort_order"),
      supabase
        .from("categories")
        .select("id,name,style_id")
        .order("sort_order"),
    ]);
    const list = (st.data ?? []) as Style[];
    setStyles(list);
    setItems((i.data ?? []) as MenuItem[]);
    setCategories((c.data ?? []) as Category[]);
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

  useEffect(() => {
    if (search.add === "1" && scopedCats.length > 0 && !modalOpen) {
      openAdd();
      navigate({ search: {} as any, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.add, scopedCats.length]);

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const openAdd = () => {
    setEditing(null);
    setForm({ ...blank, category_id: scopedCats[0]?.id ?? "" });
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      image_url: item.image_url ?? "",
      is_available: item.is_available,
      category_id: item.category_id ?? "",
    });
    setModalOpen(true);
  };

  const toggleAvailable = async (item: MenuItem, value: boolean) => {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_available: value } : it))
    );
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: value })
      .eq("id", item.id);
    if (error) {
      toast.error("Failed to update");
      load();
    } else {
      toast.success(value ? "Dish available" : "Dish hidden");
    }
  };

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, "menu");
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!styleId) return toast.error("Pick a cuisine style first");
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum)) return toast.error("Valid price is required");

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: priceNum,
      image_url: form.image_url || null,
      is_available: form.is_available,
      category_id: form.category_id || null,
      style_id: styleId,
    };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Dish updated" : "Dish added");
    setModalOpen(false);
    load();
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", confirmDel.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Dish deleted");
    setConfirmDel(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Dishes"
        subtitle="Pick a cuisine style, then add or edit dishes within its sections. Toggle availability to hide a dish without deleting it."
        action={
          <AdminButton onClick={openAdd} disabled={!styleId || scopedCats.length === 0}>
            <Plus size={16} /> Add Dish
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
        {styleId && scopedCats.length === 0 && (
          <p className="text-xs text-amber-300 mt-2">
            This style has no sections yet — add one under Menu Sections first.
          </p>
        )}
      </AdminCard>

      <AdminCard>
        {loading ? (
          <SkeletonRows />
        ) : scopedItems.length === 0 ? (
          <p className="text-center text-black/50 py-12">
            No dishes in this style yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-black/60 border-b border-black/10">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Section</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scopedItems.map((it) => (
                  <tr
                    key={it.id}
                    className="border-b border-black/5 hover:bg-black/[0.03]"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-black/5" />
                        )}
                        <span className="font-medium">{it.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-black/70">
                      {catName(it.category_id)}
                    </td>
                    <td className="py-3 px-4">
                      ₱{Number(it.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-2">
                        <Toggle
                          checked={it.is_available}
                          onChange={(v) => toggleAvailable(it, v)}
                        />
                        <span
                          className={`text-xs font-medium ${
                            it.is_available ? "text-emerald-400" : "text-black/50"
                          }`}
                        >
                          {it.is_available ? "Available" : "Sold Out"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <AdminButton
                          variant="outline"
                          onClick={() => openEdit(it)}
                          className="!px-2.5 !py-1.5"
                        >
                          <Pencil size={14} />
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          onClick={() => setConfirmDel(it)}
                          className="!px-2.5 !py-1.5"
                        >
                          <Trash2 size={14} />
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Dish" : "Add a Dish"}
        wide
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <AdminLabel>Dish Photo</AdminLabel>
            <label
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black/15 rounded-lg p-6 cursor-pointer hover:bg-black/[0.03]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onFile(f);
              }}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
              <Upload size={20} className="text-black/50" />
              <span className="text-sm text-black/60">
                {uploading
                  ? "Uploading…"
                  : "Drag a photo here or click to upload"}
              </span>
            </label>
            {form.image_url && (
              <img
                src={form.image_url}
                alt="preview"
                className="mt-3 max-h-40 rounded-md object-cover"
              />
            )}
          </div>

          <div>
            <AdminLabel>
              Dish Name <span className="text-red-400 normal-case">* required</span>
            </AdminLabel>
            <AdminInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Pad Thai"
              required
            />
          </div>

          <div>
            <AdminLabel>Short Description</AdminLabel>
            <AdminTextarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the dish in 1-2 sentences"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <AdminLabel>Price (₱)</AdminLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none">
                  ₱
                </span>
                <AdminInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="!pl-7"
                />
              </div>
            </div>
            <div>
              <AdminLabel>Section</AdminLabel>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md bg-black/5 border border-black/10 text-[#1C1C1E] outline-none focus:border-[#C8A96E]"
              >
                <option value="">— Choose a section —</option>
                {scopedCats.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/[0.03] p-4 flex items-center gap-4">
            <Toggle
              checked={form.is_available}
              onChange={(v) => setForm({ ...form, is_available: v })}
            />
            <div>
              <div className="text-sm font-medium text-[#1C1C1E]">
                Available to order
              </div>
              <div
                className={`text-xs ${
                  form.is_available ? "text-emerald-400" : "text-black/50"
                }`}
              >
                {form.is_available
                  ? "Showing on menu"
                  : "Hidden from menu (Sold Out)"}
              </div>
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
              Save Dish
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        onCancel={() => setConfirmDel(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete dish?"
        message={`This will permanently remove "${confirmDel?.name}".`}
      />
    </div>
  );
}
