/**
 * サーバーレス環境向けに最適化されたPrismaクライアント
 * コールドスタート時間の短縮とコネクション管理の最適化
 */

import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PRISMA_CONFIG } from "./config";

// Edge Runtime向けの設定
if (typeof window === "undefined" && typeof EdgeRuntime !== "undefined") {
  // WebSocket実装をポリフィルから使用
  neonConfig.webSocketConstructor = require("ws");
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
    const connectionString = process.env.DATABASE_URL;
    
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

    const adapter = new PrismaAdapter(poolInstance);
    
    prismaInstance = new PrismaClient({
      adapter,
      // ログを最小限に
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
      // エラーフォーマットを最小化
      errorFormat: "minimal",
    });

    // クエリの最適化設定
    prismaInstance.$use(async (params, next) => {
      const before = Date.now();
      
      try {
        const result = await next(params);
        const after = Date.now();
        
        // スロークエリの監視（100ms以上）
        if (after - before > 100) {
          console.warn(`Slow query detected: ${params.model}.${params.action} took ${after - before}ms`);
        }
        
        return result;
      } catch (error) {
        // コネクションエラーの場合はリトライ
        if (isConnectionError(error)) {
          console.warn("Connection error, retrying...");
          // プールをリセット
          await poolInstance?.end();
          poolInstance = null;
          prismaInstance = null;
          // 再帰的に新しいインスタンスを作成
          return getServerlessPrisma().$transaction([
            // トランザクション内で再実行
            prismaInstance.$queryRaw`SELECT 1`,
          ]);
        }
        throw error;
      }
    });
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
  process.on("beforeExit", async () => {
    await disconnectPrisma();
  });
}