import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  // まずはそのまま次へ進むレスポンスを用意する
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // リクエスト側のCookieを新しい値に差し替える
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // レスポンスを作り直して、ブラウザにも新しいCookieを返す
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // これを呼ぶと、期限切れのトークンが自動で更新される（この1行が本体）
  await supabase.auth.getUser();

  return supabaseResponse;
}
