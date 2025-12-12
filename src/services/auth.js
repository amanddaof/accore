import { supabase } from "./supabase";

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}
