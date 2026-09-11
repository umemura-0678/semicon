import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/auth/admin";
import ExamForms from "./ExamForms";
import styles from "./page.module.css";

export const metadata = {
  title: "総合問題",
};

export default async function ExamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: forms, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("chapter", "exam")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const isAdminUser = isAdmin(user);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/menu">メニューへ戻る</Link>
        {isAdminUser && <span className={styles.adminBadge}>管理者</span>}
      </nav>
      <main className={styles.main}>
        <ExamForms forms={forms ?? []} isAdminUser={isAdminUser} />
      </main>
    </div>
  );
}
