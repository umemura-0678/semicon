import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

async function logout() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}

export default async function MenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>半導体技術者検定4級対策講座</h1>
        <form action={logout}>
          <button type="submit" className={styles.logoutButton}>
            ログアウト
          </button>
        </form>
      </header>
      <main className={styles.main}>
        <div className={styles.cards}>
          <article className={styles.card}>
            <p className={styles.chapterNumber}>第１章</p>
            <h2 className={styles.chapterTitle}>
              社会の発展と半導体、半導体の品質管理
            </h2>
            <ul className={styles.submenu}>
              <li>1.1　半導体の過去、現在、未来</li>
              <li>1.2　半導体は何に使われている？</li>
              <li>1.3　半導体を安心して使うためには？</li>
              <li>1.4　半導体とSDGｓの関係性</li>
            </ul>
          </article>
          <article className={styles.card}>
            <p className={styles.chapterNumber}>第２章</p>
            <h2 className={styles.chapterTitle}>半導体の物性と基礎</h2>
            <ul className={styles.submenu}>
              <li>2.1　半導体とは</li>
              <li>2.2　電気回路と半導体</li>
              <li>2.3　半導体システムの役割と課題</li>
            </ul>
          </article>
          <article className={styles.card}>
            <p className={styles.chapterNumber}>第３章</p>
            <h2 className={styles.chapterTitle}>半導体の種類とその特徴</h2>
            <ul className={styles.submenu}>
              <li>3.1　さまざまな半導体デバイスと使われ方</li>
              <li>3.2　ロジックデバイス</li>
              <li>3.3　アナログ回路</li>
              <li>3.4　情報を記録するメモリデバイス</li>
              <li>3.5　集積回路の製造工程</li>
            </ul>
          </article>
          <article className={styles.card}>
            <p className={styles.chapterNumber}>第４章</p>
            <h2 className={styles.chapterTitle}>半導体の品質保証と試験項目</h2>
            <ul className={styles.submenu}>
              <li>4.1　品質・信頼性とは</li>
              <li>4.2　品質・信頼性の保証</li>
              <li>4.3　半導体試験とは</li>
              <li>4.4　半導体試験項目</li>
            </ul>
          </article>
        </div>
      </main>
    </div>
  );
}
