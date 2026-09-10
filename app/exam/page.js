import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import qrImage from "./QR_sougou1.png";
import styles from "./page.module.css";

const EXAM_URL = "https://forms.cloud.microsoft/r/CFEmTGA4rL";

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

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/menu">メニューへ戻る</Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.content}>
          <a
            href={EXAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.qrLink}
          >
            <Image
              src={qrImage}
              alt="総合問題No.1"
              className={styles.qr}
              priority
            />
          </a>
          <a
            href={EXAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.url}
          >
            {EXAM_URL}
          </a>
        </div>
      </main>
    </div>
  );
}
