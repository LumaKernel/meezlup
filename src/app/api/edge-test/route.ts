/**
 * Edge Runtime動作確認用エンドポイント
 */

import { NextRequest } from "next/server";
import { testEdgeCompatibility, runtime, createEdgePrismaClient } from "@/lib/prisma/edge-compat";

// Edge Runtimeを明示的に指定
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const results = {
    runtime: runtime.type,
    timestamp: new Date().toISOString(),
    compatibility: await testEdgeCompatibility(),
    environment: {
      hasWebSocket: runtime.hasWebSocket,
      hasStreams: runtime.hasStreams,
      canAccessFileSystem: runtime.canAccessFileSystem,
      canUseNativeModules: runtime.canUseNativeModules,
    },
    prismaTest: {
      success: false,
      error: null as string | null,
      data: null as unknown,
    },
  };

  // Prisma接続テスト
  if (process.env.DATABASE_URL) {
    try {
      const prisma = createEdgePrismaClient(process.env.DATABASE_URL);
      
      // 基本的なクエリテスト
      const testQuery = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
      
      results.prismaTest.success = true;
      results.prismaTest.data = testQuery;
    } catch (error) {
      results.prismaTest.success = false;
      results.prismaTest.error = error instanceof Error ? error.message : "Unknown error";
    }
  } else {
    results.prismaTest.error = "DATABASE_URL not configured";
  }

  return Response.json(results, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}