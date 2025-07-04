/**
 * サーバーレス環境向けに最適化されたPrismaクライアント
 * コールドスタート時間の短縮とコネクション管理の最適化
 */

import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { buildConnectionUrl } from "./config";

// Edge Runtime向けの設定
if (typeof window === "undefined") {
  neonConfig.poolQueryViaFetch = true;
}

// Prismaクライアントのシングルトンインスタンス
let prismaInstance: PrismaClient | null = null;

// コネクションプールのシングルトンインスタンス
let poolInstance: Pool | null = null;

/**
 * サーバーレス環境用の最適化されたPrismaクライアントを取得
 */
export function getServerlessPrisma(): PrismaClient {
  // 既存のインスタンスがあれば再利用（コールドスタート対策）
  if (prismaInstance) {
    return prismaInstance;
  }

  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    // 本番環境: Neon Serverless Driverを使用
    const connectionString = buildConnectionUrl(process.env.DATABASE_URL);
    
    // プールの作成（再利用可能）
    if (!poolInstance) {
      poolInstance = new Pool({
        connectionString,
        // サーバーレス向け最小設定
        max: 1, // サーバーレス関数は単一コネクション
        idleTimeoutMillis: 0, // アイドルタイムアウトを無効化
        connectionTimeoutMillis: 5000, // 接続タイムアウトを短縮
      });
    }

    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
      errorFormat: "minimal",
    });

    // コネクション監視設定（シンプル版）
    const originalConnect = prismaInstance.$connect.bind(prismaInstance);
    prismaInstance.$connect = async () => {
      try {
        await originalConnect();
      } catch (error) {
        if (isConnectionError(error)) {
          console.warn("Connection error, retrying...");
          await poolInstance?.end().catch(() => {});
          poolInstance = null;
          prismaInstance = null;
          throw error;
        }
        throw error;
      }
    };
  } else {
    // 開発環境: 通常のPrismaクライアント
    prismaInstance = new PrismaClient({
      log: ["query", "info", "warn", "error"],
      errorFormat: "pretty",
    });
  }

  return prismaInstance;
}

/**
 * Prismaクライアントのウォームアップ
 * コールドスタートの影響を最小化
 */
export async function warmupPrisma(): Promise<void> {
  const prisma = getServerlessPrisma();
  
  try {
    // 軽量なクエリでコネクションを確立
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("Failed to warmup Prisma connection:", error);
  }
}

/**
 * コネクションエラーかどうかを判定
 */
function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    );
  }
  return false;
}

/**
 * グレースフルシャットダウン
 * サーバーレス環境では通常不要だが、ローカル開発用に提供
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
  
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}

// プロセス終了時のクリーンアップ（開発環境のみ）
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", () => {
    disconnectPrisma().catch(console.error);
  });
}