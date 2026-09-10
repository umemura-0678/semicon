import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import StudyPage from "./StudyPage";

export const metadata = {
  title: "2.1　半導体とは",
};

export default async function Chapter21Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <StudyPage />;
}
