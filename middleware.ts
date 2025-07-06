import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  // 静的ファイルとAPIルートは処理しない
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("/api/") ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  }

  // App Routerでの言語ルーティングは手動で処理
  // 言語プレフィックスがない場合はデフォルト言語にリダイレクト
  const pathname = req.nextUrl.pathname;
  const pathnameIsMissingLocale =
    !pathname.startsWith("/ja") && !pathname.startsWith("/en");

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/ja${pathname satisfies string}`, req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
