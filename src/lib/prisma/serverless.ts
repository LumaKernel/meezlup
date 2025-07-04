// サーバーレス環境用のPrismaクライアント設定
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { PRISMA_CONFIG, buildConnectionUrl } from "./config";

// 開発環境と本番環境で異なるクライアントを作成
function createPrismaClient() {
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    // 本番環境: Neon Serverless Driverを使用
    const connectionString = buildConnectionUrl(process.env.DATABASE_URL);
    const pool = new Pool({ 
      connectionString,
      // サーバーレス向け最適化
      connectionTimeoutMillis: PRISMA_CONFIG.serverless.connect_timeout * 1000,
      // HTTPモードを有効化（Edge Runtime対応）
      connectionString: connectionString.includes("sslmode=") 
        ? connectionString 
        : `${connectionString}?sslmode=require`,
    });
    const adapter = new PrismaAdapter(pool);
    
    return new PrismaClient({
      adapter,
      log: PRISMA_CONFIG.common.log,
      errorFormat: PRISMA_CONFIG.common.errorFormat,
    });
  } else {
    // 開発環境: 通常のPrismaクライアント（SQLite）
    return new PrismaClient({
      log: PRISMA_CONFIG.common.log,
      errorFormat: PRISMA_CONFIG.common.errorFormat,
    });
  }
}

// グローバルな型定義
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// サーバーレス環境でのコネクション再利用
export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// クリーンアップ関数
export async function disconnect() {
  await prisma.$disconnect();
}