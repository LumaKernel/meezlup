import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Auth0セッションを取得
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // データベースからユーザー情報を取得
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser) {
      // ユーザーが存在しない場合は作成
      const newUser = await prisma.user.create({
        data: {
          auth0Id: session.user.sub,
          email: session.user.email || "",
          name:
            session.user.name ||
            session.user.nickname ||
            session.user.email ||
            "",
        },
      });

      return NextResponse.json({
        id: newUser.id, // データベースID
        sub: session.user.sub, // Auth0 ID（互換性のため）
        email: newUser.email,
        name: newUser.name,
        picture: session.user.picture,
        nickname: session.user.nickname,
        email_verified: session.user.email_verified,
      });
    }

    // 既存ユーザーの情報を返す
    return NextResponse.json({
      id: dbUser.id, // データベースID
      sub: session.user.sub, // Auth0 ID（互換性のため）
      email: dbUser.email,
      name: dbUser.name,
      picture: session.user.picture,
      nickname: session.user.nickname,
      email_verified: session.user.email_verified,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
