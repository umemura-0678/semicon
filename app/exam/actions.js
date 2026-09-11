"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth/admin";
import { isFormsUrl } from "@/utils/forms";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export async function addExamForm(formData) {
  const title = formData.get("title");

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

  const formsInput = formData.get("forms_url");
  const formsUrl = typeof formsInput === "string" ? formsInput.trim() : "";

  if (!isFormsUrl(formsUrl)) {
    return;
  }

  const file = formData.get("image");
  const isFile =
    file && typeof file === "object" && "size" in file && file.size > 0;

  if (
    !isFile ||
    !ALLOWED_TYPES.includes(file.type) ||
    file.size > MAX_SIZE
  ) {
    return;
  }

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("study-images")
    .upload(path, file);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage.from("study-images").getPublicUrl(path);

  await supabase.from("study_materials").insert({
    title: title.trim(),
    forms_url: formsUrl,
    image_url: data.publicUrl,
    chapter: "exam",
    user_id: user.id,
  });

  revalidatePath("/exam");
}

export async function deleteExamForm(formData) {
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
  revalidatePath("/exam");
}
