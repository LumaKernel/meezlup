import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./lib/i18n/persistence";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("[Middleware] Processing request:", pathname);

  // ロケールプレフィックス付きの認証ルートをチェック
  // 例: /ja/auth/login -> /auth/login にリダイレクト
  const localeAuthMatch = pathname.match(/^\/([a-z]{2})\/auth(\/.*)?$/);
  if (localeAuthMatch) {
    const authPath = `/auth${(localeAuthMatch[2] || "") satisfies string}`;
    const newUrl = new URL(authPath, request.url);
    // クエリパラメータを保持
    newUrl.search = request.nextUrl.search;
    console.log("[Middleware] Redirecting from", pathname, "to", authPath);
    return NextResponse.redirect(newUrl);
  }

  // 静的ファイルとAPIルートをスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".")
  ) {
    try {
      console.log("[Middleware] Processing auth route:", pathname);
      const response = await auth0.middleware(request);
      console.log("[Middleware] Auth0 response status:", response.status);
      console.log(
        "[Middleware] Auth0 response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      // セッション状態を確認
      if (pathname === "/auth/profile") {
        try {
          const session = await auth0.getSession(request);
          console.log(
            "[Middleware] Session for /auth/profile:",
            session ? "exists" : "null",
          );
          if (session) {
            console.log("[Middleware] Session user:", session.user.sub);
          }
        } catch (sessionError) {
          console.error("[Middleware] Session check error:", sessionError);
        }
      }

      return response;
    } catch (error) {
      console.error("[Middleware] Auth0 middleware error:", error);
      throw error;
    }
  }

  // パスから言語を取得
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(
    (locale) =>
      pathname.startsWith(`/${locale satisfies string}/`) ||
      pathname === `/${locale satisfies string}`,
  );

  // 言語が含まれていない場合は、デフォルト言語にリダイレクト
  if (!pathnameHasLocale) {
    // Cookieから言語を取得、なければデフォルト言語を使用
    const cookieLocale = request.cookies.get("i18nextLng")?.value;
    const locale = (SUPPORTED_LANGUAGES as ReadonlyArray<string>).includes(
      cookieLocale || "",
    )
      ? (cookieLocale as (typeof SUPPORTED_LANGUAGES)[number])
      : DEFAULT_LANGUAGE;
    const pathToAppend = pathname === "/" ? "" : pathname;
    const newUrl = new URL(
      `/${locale satisfies string}${pathToAppend satisfies string}`,
      request.url,
    );
    return NextResponse.redirect(newUrl);
  }

  // Auth0ミドルウェアを実行
  try {
    const response = await auth0.middleware(request);
    console.log("[Middleware] Auth0 response:", response.status);
    return response;
  } catch (error) {
    console.error("[Middleware] Error:", error);
    throw error;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
