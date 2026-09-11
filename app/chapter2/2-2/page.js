import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth/admin";
import StudyPage from "./StudyPage";
import Materials from "@/components/Materials";

export const metadata = {
  title: "2.2　電気回路と半導体",
};

export default async function Chapter22Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: materials, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("chapter", "2-2")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const isAdminUser = isAdmin(user);

  return (
    <StudyPage isAdminUser={isAdminUser}>
      <Materials
        chapter="2-2"
        materials={materials ?? []}
        isAdminUser={isAdminUser}
      />
    </StudyPage>
  );
}
