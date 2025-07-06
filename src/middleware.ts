import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./lib/i18n/persistence";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("[Middleware] Processing request:", pathname);

  // 静的ファイルとAPIルートをスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".")
  ) {
    try {
      const response = await auth0.middleware(request);
      console.log("[Middleware] Auth0 response:", response.status);
      return response;
    } catch (error) {
      console.error("[Middleware] Error:", error);
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
