import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import StudyPage from "./StudyPage";

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

  return <StudyPage />;
}
