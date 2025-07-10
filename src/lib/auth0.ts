import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async onCallback(error, context, session) {
    if (error) {
      console.error("Auth0 callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/error?error=${encodeURIComponent(error.message) satisfies string}`,
          process.env.APP_BASE_URL || "http://localhost:5825",
        ),
      );
    }

    if (session?.user) {
      try {
        // ユーザー情報をデータベースに保存/更新
        await syncUserWithDatabase(session);
        console.log("User synced with database:", session.user.sub);
      } catch (dbError) {
        console.error("Database sync error:", dbError);
        // エラーが発生してもログインは継続
      }
    }

    // ログイン成功後のリダイレクト
    const redirectUrl = new URL(
      context.returnTo || "/",
      process.env.APP_BASE_URL || "http://localhost:5825",
    );

    // 認証後のページリフレッシュを確実にするため、
    // タイムスタンプをクエリパラメータに追加
    redirectUrl.searchParams.set("auth", Date.now().toString());

    return NextResponse.redirect(redirectUrl);
  },
});

/**
 * Auth0セッションとデータベースを同期
 */
async function syncUserWithDatabase(session: {
  user: { sub: string; email?: string; name?: string; nickname?: string };
}) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    if (!session.user.email) {
      throw new Error("Email is required for user creation");
    }

    const userData = {
      auth0Id: session.user.sub,
      email: session.user.email,
      name: session.user.name || session.user.nickname || session.user.email,
    };

    // upsert: 存在すれば更新、なければ作成
    await prisma.user.upsert({
      where: { auth0Id: userData.auth0Id },
      update: {
        email: userData.email,
        name: userData.name,
        updatedAt: new Date(),
      },
      create: userData,
    });
  } finally {
    await prisma.$disconnect();
  }
}
