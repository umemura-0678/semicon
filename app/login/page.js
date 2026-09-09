import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

// エラーコードと表示メッセージの対応表
const ERROR_MESSAGES = {
  invalid: "メールアドレスまたはパスワードが違います。",
  short: "パスワードは6文字以上で入力してください。",
  exists: "このメールアドレスはすでに登録されています。",
  signup: "登録に失敗しました。入力内容を確認してください。"
};

// ログインする
async function login(formData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  // 失敗したらログインページに戻し、URLにエラーコードを付ける
  if (error) {
    redirect("/login?error=invalid");
  }

  revalidatePath("/", "layout");
  redirect("/menu");
}

// 新規登録する
async function signUp(formData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  // Supabaseの初期設定ではパスワードは6文字以上
  if (password.length < 6) {
    redirect("/login?error=short");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("already registered")) {
      redirect("/login?error=exists");
    }
    redirect("/login?error=signup");
  }

  revalidatePath("/", "layout");
  redirect("/menu");
}

export default async function LoginPage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // すでにログイン済みならメニューへ進む
  if (user) {
    redirect("/menu");
  }

  // URLの ?error=xxx を受け取る
  const { error } = await searchParams;
  const message = ERROR_MESSAGES[error];

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1>ログイン</h1>

        {/* エラーがあるときだけ表示する */}
        {message && <p className={styles.error}>{message}</p>}

        <form className={styles.form}>
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="パスワード（6文字以上）"
            minLength={6}
            required
          />
          <button formAction={login}>ログイン</button>
          <button formAction={signUp}>新規登録</button>
        </form>

        <Link href="/">トップへ戻る</Link>
      </div>
    </main>
  );
}
