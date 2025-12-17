import { supabase } from "./supabase";

export async function logout(navigate) {
  await supabase.auth.signOut();
  navigate("/login", { replace: true });
}
