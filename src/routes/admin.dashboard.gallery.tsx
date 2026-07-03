import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/storage";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  ConfirmDialog,
  PageHeader,
  SkeletonRows,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/dashboard/gallery")({
  component: GalleryManager,
});

type GalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

const MAX_PHOTOS = 20;

function GalleryManager() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDel, setConfirmDel] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const atLimit = items.length >= MAX_PHOTOS;

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order");
    setItems((data ?? []) as GalleryItem[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (file: File) => {
    if (items.length >= MAX_PHOTOS) {
      toast.error(`You've reached the ${MAX_PHOTOS}-photo limit. Delete one to add another.`);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, "gallery");
      const { error } = await supabase.from("gallery").insert({
        image_url: url,
        caption: caption.trim() || null,
        sort_order: items.length,
      });
      if (error) throw error;
      toast.success("Photo uploaded");
      setCaption("");
      load();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[idx];
    const b = items[target];
    const next = [...items];
    next[idx] = b;
    next[target] = a;
    setItems(next);
    const res = await Promise.all([
      supabase.from("gallery").update({ sort_order: target }).eq("id", a.id),
      supabase.from("gallery").update({ sort_order: idx }).eq("id", b.id),
    ]);
    if (res.some((r) => r.error)) {
      toast.error("Reorder failed");
      load();
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", confirmDel.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Photo deleted");
    setConfirmDel(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Gallery Manager"
        subtitle={`Upload, caption, reorder, and delete gallery photos. ${items.length}/${MAX_PHOTOS} used.`}
      />

      <AdminCard className="mb-6 p-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-3 items-start">
          <div>
            <AdminInput
              placeholder="Optional caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.target.value = "";
              }}
            />
            <AdminButton
              type="button"
              loading={uploading}
              disabled={atLimit}
              title={atLimit ? `Limit of ${MAX_PHOTOS} photos reached` : undefined}
              onClick={(e) =>
                (e.currentTarget.previousSibling as HTMLInputElement)?.click()
              }
            >
              <Upload size={16} /> {atLimit ? "Limit Reached" : "Upload Photo"}
            </AdminButton>
          </label>
        </div>
      </AdminCard>

      {loading ? (
        <AdminCard>
          <SkeletonRows />
        </AdminCard>
      ) : items.length === 0 ? (
        <AdminCard className="p-12 text-center text-black/50">
          No photos yet. Upload your first one above.
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, idx) => (
            <AdminCard key={it.id} className="overflow-hidden flex flex-col">
              <div className="aspect-square overflow-hidden bg-black/40">
                <img
                  src={it.image_url}
                  alt={it.caption ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 flex-1 flex flex-col gap-2">
                <p className="text-sm text-black/80 line-clamp-2 min-h-[2.5rem]">
                  {it.caption ?? <span className="text-black/40">No caption</span>}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded border border-black/15 text-black/70 hover:bg-black/5 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="p-1.5 rounded border border-black/15 text-black/70 hover:bg-black/5 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <AdminButton
                    variant="danger"
                    onClick={() => setConfirmDel(it)}
                    className="!px-2.5 !py-1.5"
                  >
                    <Trash2 size={14} />
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onCancel={() => setConfirmDel(null)}
        onConfirm={doDelete}
        loading={deleting}
        title="Delete photo?"
        message="This will permanently remove the photo from the gallery."
      />
    </div>
  );
}
