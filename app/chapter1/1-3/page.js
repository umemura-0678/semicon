import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth/admin";
import StudyPage from "./StudyPage";
import Materials from "@/components/Materials";

export const metadata = {
  title: "1.3　半導体を安心して使うためには？",
};

export default async function Chapter13Page() {
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
    .eq("chapter", "1-3")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const isAdminUser = isAdmin(user);

  return (
    <StudyPage isAdminUser={isAdminUser}>
      <Materials
        chapter="1-3"
        materials={materials ?? []}
        isAdminUser={isAdminUser}
      />
    </StudyPage>
  );
}
