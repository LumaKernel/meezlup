#!/usr/bin/env node

/**
 * 環境に応じて適切なPrismaスキーマファイルを選択するスクリプト
 */

const fs = require("fs");
const path = require("path");

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production";
const schemaDir = path.join(__dirname, "..", "prisma");
const targetSchema = path.join(schemaDir, "schema.prisma");

if (isProduction) {
  // 本番環境: PostgreSQLスキーマを使用
  const postgresSchema = path.join(schemaDir, "schema.postgresql.prisma");

  if (fs.existsSync(postgresSchema)) {
    console.log("🚀 Using PostgreSQL schema for production environment");
    fs.copyFileSync(postgresSchema, targetSchema);
  } else {
    console.error("❌ PostgreSQL schema file not found!");
    process.exit(1);
  }
} else {
  // 開発環境: SQLiteスキーマを維持
  console.log("💻 Using SQLite schema for development environment");
  // schema.prismaは既にSQLite用なので何もしない
}

console.log("✅ Prisma schema setup completed");
