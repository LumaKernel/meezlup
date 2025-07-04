// Prismaのコネクションプーリング設定

export const PRISMA_CONFIG = {
  // サーバーレス環境向けの設定
  serverless: {
    // Neon Serverless Driverの推奨設定
    connection_limit: 1, // サーバーレス関数は単一コネクション
    pool_timeout: 0, // プールタイムアウトを無効化
    pgbouncer: true, // PgBouncerを有効化（Neonの場合）
    connect_timeout: 10, // 接続タイムアウト（秒）
  },
  
  // 開発環境向けの設定
  development: {
    connection_limit: 5,
    pool_timeout: 10,
    connect_timeout: 5,
  },
  
  // 共通設定
  common: {
    // ログレベル
    log: process.env.NODE_ENV === "production" 
      ? ["error", "warn"] 
      : ["query", "info", "warn", "error"],
    
    // エラーフォーマット
    errorFormat: process.env.NODE_ENV === "production" 
      ? "minimal" 
      : "pretty",
  },
} as const;

// 接続URL構築ヘルパー
export function buildConnectionUrl(baseUrl: string, options?: Record<string, unknown>) {
  const url = new URL(baseUrl);
  
  // サーバーレス環境向けの最適化パラメータ
  if (process.env.NODE_ENV === "production") {
    url.searchParams.set("connection_limit", PRISMA_CONFIG.serverless.connection_limit.toString());
    url.searchParams.set("pool_timeout", PRISMA_CONFIG.serverless.pool_timeout.toString());
    
    if (PRISMA_CONFIG.serverless.pgbouncer) {
      url.searchParams.set("pgbouncer", "true");
    }
    
    url.searchParams.set("connect_timeout", PRISMA_CONFIG.serverless.connect_timeout.toString());
  }
  
  // 追加オプションの適用
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  
  return url.toString();
}