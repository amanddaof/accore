import { supabase } from "./supabase";

export async function uploadAvatar(file, userId) {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
