"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth/admin";
import { getYoutubeId } from "@/utils/youtube";

export async function addMaterial(formData) {
  const title = formData.get("title");
  const chapter = formData.get("chapter") || "2-1";

  if (!title || title.trim() === "") {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    return;
  }

  const youtubeInput = formData.get("youtube_url");
  const youtubeUrl =
    typeof youtubeInput === "string" ? youtubeInput.trim() : "";
  const youtubeId = getYoutubeId(youtubeUrl);

  if (!youtubeId) {
    return;
  }

  await supabase.from("study_materials").insert({
    title: title.trim(),
    youtube_url: `https://www.youtube.com/watch?v=${youtubeId}`,
    chapter,
    user_id: user.id,
  });

  revalidatePath("/chapter2/2-1");
}

export async function deleteMaterial(formData) {
  const id = formData.get("id");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user) || !id) {
    return;
  }

  await supabase.from("study_materials").delete().eq("id", id);
  revalidatePath("/chapter2/2-1");
}
