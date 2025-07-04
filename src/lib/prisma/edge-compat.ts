/**
 * Edge Runtime互換性の確認と対策
 */

import { PrismaClient } from "@prisma/client/edge";
import { PrismaAdapter } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

// Edge Runtimeの検出
export const isEdgeRuntime = typeof EdgeRuntime !== "undefined";

// Node.js固有のAPIが利用可能かチェック
export const hasNodeApis = typeof process !== "undefined" && process.versions?.node;

/**
 * Edge Runtime向けの設定
 */
export function configureForEdgeRuntime() {
  if (!isEdgeRuntime) {
    return;
  }

  // WebSocket実装の設定
  // Edge Runtimeでは標準のWebSocketを使用
  neonConfig.useSecureWebSocket = true;
  neonConfig.wsProxy = (host) => `${host}/v1`;
  
  // フェッチ実装の設定
  neonConfig.poolQueryViaFetch = true;
  
  console.log("✅ Configured for Edge Runtime");
}

/**
 * Edge Runtime対応のPrismaクライアント作成
 */
export function createEdgePrismaClient(databaseUrl: string): PrismaClient {
  configureForEdgeRuntime();
  
  const pool = new Pool({
    connectionString: databaseUrl,
    // Edge Runtime向けの設定
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 3000,
  });

  const adapter = new PrismaAdapter(pool);
  
  return new PrismaClient({
    adapter,
    // Edge Runtimeでは最小限のログ
    log: ["error"],
    errorFormat: "minimal",
  });
}

/**
 * Edge Runtimeでサポートされていない機能の代替実装
 */
export const edgeCompat = {
  // Buffer APIの代替
  encodeBase64: (data: string): string => {
    if (typeof btoa !== "undefined") {
      return btoa(data);
    }
    throw new Error("Base64 encoding not available in this runtime");
  },
  
  decodeBase64: (data: string): string => {
    if (typeof atob !== "undefined") {
      return atob(data);
    }
    throw new Error("Base64 decoding not available in this runtime");
  },
  
  // crypto APIの使用
  generateId: (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // フォールバック実装
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // 環境変数の取得（Edge Runtimeセーフ）
  getEnv: (key: string): string | undefined => {
    // Vercel Edge Runtimeの場合
    if (typeof process === "undefined") {
      // @ts-expect-error - Edge Runtimeでの環境変数アクセス
      return globalThis[key];
    }
    return process.env[key];
  },
};

/**
 * Edge Runtime互換性のテスト
 */
export async function testEdgeCompatibility(): Promise<{
  compatible: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  // 必須のグローバルAPIチェック
  const requiredGlobals = ["fetch", "crypto", "TextEncoder", "TextDecoder"];
  
  for (const api of requiredGlobals) {
    if (!(api in globalThis)) {
      issues.push(`Missing required API: ${api}`);
    }
  }
  
  // WebSocketサポート
  if (!("WebSocket" in globalThis)) {
    issues.push("WebSocket API not available");
  }
  
  // Prisma Edge Client確認
  try {
    await import("@prisma/client/edge");
  } catch {
    issues.push("Prisma Edge Client not available");
  }
  
  return {
    compatible: issues.length === 0,
    issues,
  };
}

/**
 * ランタイム固有の機能を抽象化
 */
export const runtime = {
  // 現在のランタイムタイプ
  type: isEdgeRuntime ? "edge" : hasNodeApis ? "node" : "browser",
  
  // ファイルシステムアクセス（Node.jsのみ）
  canAccessFileSystem: hasNodeApis,
  
  // ネイティブモジュール（Node.jsのみ）
  canUseNativeModules: hasNodeApis,
  
  // WebSocket実装
  hasWebSocket: "WebSocket" in globalThis,
  
  // Streams API
  hasStreams: "ReadableStream" in globalThis,
};