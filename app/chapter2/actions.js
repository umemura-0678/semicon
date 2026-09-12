"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth/admin";
import { getYoutubeId } from "@/utils/youtube";

const CHAPTER_PATHS = {
  "1-1": "/chapter1/1-1",
  "1-2": "/chapter1/1-2",
  "1-3": "/chapter1/1-3",
  "1-4": "/chapter1/1-4",
  "2-1": "/chapter2/2-1",
  "2-2": "/chapter2/2-2",
};

function chapterPath(chapter) {
  return CHAPTER_PATHS[chapter] ?? null;
}

export async function addMaterial(formData) {
  const title = formData.get("title");
  const chapter = formData.get("chapter");
  const path = chapterPath(chapter);

  if (!title || title.trim() === "" || !path) {
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

  revalidatePath(path);
}

export async function deleteMaterial(formData) {
  const id = formData.get("id");
  const chapter = formData.get("chapter");
  const path = chapterPath(chapter);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user) || !id || !path) {
    return;
  }

  await supabase.from("study_materials").delete().eq("id", id);
  revalidatePath(path);
}
