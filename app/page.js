import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>半導体技術者検定4級対策講座</h1>
        <Link href="/login" className={styles.loginButton}>
          ログイン
        </Link>
      </header>
    </div>
  );
}
