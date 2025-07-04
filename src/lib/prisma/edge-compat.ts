/**
 * Edge Runtime互換性の確認と対策
 */

import type { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";

// Edge Runtimeの検出
export const isEdgeRuntime =
  typeof globalThis !== "undefined" && "EdgeRuntime" in globalThis;

// Node.js固有のAPIが利用可能かチェック
export const hasNodeApis = (() => {
  try {
    return (
      typeof process !== "undefined" &&
      Boolean(process.versions) &&
      "node" in process.versions
    );
  } catch (error) {
    console.warn("Node.js API check failed:", error);
    return false;
  }
})();

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
  neonConfig.wsProxy = (host) => `${host satisfies string}/v1`;

  // フェッチ実装の設定
  neonConfig.poolQueryViaFetch = true;

  console.log("✅ Configured for Edge Runtime");
}

/**
 * Edge Runtime対応のPrismaクライアント作成
 */
export async function createEdgePrismaClient(
  databaseUrl: string,
): Promise<PrismaClient> {
  configureForEdgeRuntime();

  // 通常のPrismaClientを返す（Neon Serverlessが自動でEdge対応）
  const { PrismaClient: EdgePrismaClient } = await import("@prisma/client");

  return new EdgePrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
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
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    // フォールバック実装
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    return `${timestamp satisfies number}-${randomStr satisfies string}`;
  },

  // 環境変数の取得（Edge Runtimeセーフ）
  getEnv: (key: string): string | undefined => {
    try {
      if (typeof process === "undefined") {
        return (globalThis as Record<string, unknown>)[key] as
          | string
          | undefined;
      }
      return process.env[key];
    } catch (error) {
      console.warn(
        `Failed to get environment variable ${key satisfies string}:`,
        error,
      );
      return undefined;
    }
  },
};

/**
 * Edge Runtime互換性のテスト
 */
export async function testEdgeCompatibility(): Promise<{
  compatible: boolean;
  issues: Array<string>;
}> {
  const issues: Array<string> = [];

  // 必須のグローバルAPIチェック
  const requiredGlobals: Array<string> = [
    "fetch",
    "crypto",
    "TextEncoder",
    "TextDecoder",
  ];

  for (const api of requiredGlobals) {
    if (!(api in globalThis)) {
      issues.push(`Missing required API: ${api satisfies string}`);
    }
  }

  // WebSocketサポート
  if (!("WebSocket" in globalThis)) {
    issues.push("WebSocket API not available");
  }

  // Prisma Client確認
  try {
    await import("@prisma/client");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    issues.push(`Prisma Client not available: ${errorMsg satisfies string}`);
  }

  return {
    compatible: issues.length === 0,
    issues,
  };
}

/**
 * ランタイム固有の機能を抽象化
 */
export const runtime: {
  readonly type: "edge" | "node" | "browser";
  readonly canAccessFileSystem: boolean;
  readonly canUseNativeModules: boolean;
  readonly hasWebSocket: boolean;
  readonly hasStreams: boolean;
} = {
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
