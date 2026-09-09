import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストでmiddlewareを実行する:
     * - _next/static  (ビルドされたJS/CSS)
     * - _next/image   (画像最適化API)
     * - favicon.ico
     * - 画像ファイル
     * 画像やCSSでセッション更新をしても無駄なので除外している
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
