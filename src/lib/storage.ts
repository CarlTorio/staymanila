import { supabase } from "@/integrations/supabase/client";

const BUCKET = "restaurant-images";

export async function uploadImage(file: File, prefix = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
