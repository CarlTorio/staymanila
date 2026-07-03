import { supabase } from "@/integrations/supabase/client";

// Admin auth is backed by Supabase Auth (email + password).
// Only authenticated users can perform writes (enforced by RLS on the DB).

export async function isAdminAuthed(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}
