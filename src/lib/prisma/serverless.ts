// サーバーレス環境用のPrismaクライアント設定
import "server-only";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PRISMA_CONFIG, buildConnectionUrl } from "./config";

// 統一されたPrismaクライアントを作成
function createPrismaClient() {
  // Neon設定の初期化
  neonConfig.poolQueryViaFetch = true;

  // DATABASE_URLが設定されている場合はそれを使用
  if (process.env.DATABASE_URL) {
    const connectionString = buildConnectionUrl(process.env.DATABASE_URL);
    return new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
      log: PRISMA_CONFIG.common.log as never,
      errorFormat: PRISMA_CONFIG.common.errorFormat,
    });
  }

  // デフォルト（SQLite）
  return new PrismaClient({
    log: PRISMA_CONFIG.common.log as never,
    errorFormat: PRISMA_CONFIG.common.errorFormat,
  });
}

// Singletonパターンで実装（globalは使わない）
let prismaInstance: PrismaClient | undefined;

// サーバーレス環境でのコネクション再利用
export const prisma = (() => {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
})();

// クリーンアップ関数
export async function disconnect() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.warn("Failed to disconnect Prisma:", error);
  }
}
