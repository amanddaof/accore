import { supabase } from "./supabase";

export async function getReservations() {
  const { data, error } = await supabase
    .from("reservations")
    .select(`
      *,
      categoria:category_id (
        id,
        name,
        color,
        active
      )
    `);

  if (error) throw error;
  return data || [];
}
