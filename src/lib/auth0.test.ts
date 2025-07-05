/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextResponse } from "next/server";

// Prismaのモック
const mockPrismaUser = {
  upsert: vi.fn(),
};

const mockPrisma = {
  user: mockPrismaUser,
  $disconnect: vi.fn(),
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// NextResponseのモック
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ redirect: url.toString() })),
  },
}));

describe("Auth0 Callback Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数のモック
    process.env.APP_BASE_URL = "http://localhost:5825";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("onCallback", () => {
    it("正常なログイン後にユーザーをデータベースに保存し、リダイレクトする", async () => {
      const mockSession = {
        user: {
          sub: "auth0|test123",
          email: "test@example.com",
          name: "Test User",
          nickname: "testuser",
        },
      };

      const mockContext = {
        returnTo: "/dashboard",
      };

      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      // auth0.tsからコールバック関数を動的にインポート
      const { auth0 } = await import("./auth0");
      const onCallback = (auth0 as any).options?.onCallback;

      expect(onCallback).toBeDefined();

      const result = await onCallback(null, mockContext, mockSession);

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith({
        where: { auth0Id: "auth0|test123" },
        update: {
          email: "test@example.com",
          name: "Test User",
          updatedAt: expect.any(Date),
        },
        create: {
          auth0Id: "auth0|test123",
          email: "test@example.com",
          name: "Test User",
        },
      });

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/dashboard", "http://localhost:5825")
      );
    });

    it("エラー発生時はエラーページにリダイレクトする", async () => {
      const mockError = new Error("Auth0 error");
      const mockContext = {};

      const { auth0 } = await import("./auth0");
      const onCallback = (auth0 as any).options?.onCallback;

      const result = await onCallback(mockError, mockContext, null);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/error?error=Auth0%20error", "http://localhost:5825")
      );
    });

    it("データベースエラー時もログインを継続し、エラーをログに出力する", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const mockSession = {
        user: {
          sub: "auth0|test123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      const mockContext = {
        returnTo: null,
      };

      mockPrismaUser.upsert.mockRejectedValue(new Error("Database error"));

      const { auth0 } = await import("./auth0");
      const onCallback = (auth0 as any).options?.onCallback;

      const result = await onCallback(null, mockContext, mockSession);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Database sync error:",
        expect.any(Error)
      );

      // エラーが発生してもログインは継続される
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:5825")
      );

      consoleSpy.mockRestore();
    });

    it("ユーザー名がない場合はnicknameまたはemailを使用する", async () => {
      const mockSession = {
        user: {
          sub: "auth0|test123",
          email: "test@example.com",
          name: null,
          nickname: "testuser",
        },
      };

      const mockContext = {};

      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      const { auth0 } = await import("./auth0");
      const onCallback = (auth0 as any).options?.onCallback;

      await onCallback(null, mockContext, mockSession);

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            name: "testuser",
          }),
        })
      );
    });

    it("nameもnicknameもない場合はemailを使用する", async () => {
      const mockSession = {
        user: {
          sub: "auth0|test123",
          email: "test@example.com",
          name: null,
          nickname: null,
        },
      };

      const mockContext = {};

      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "test@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      const { auth0 } = await import("./auth0");
      const onCallback = (auth0 as any).options?.onCallback;

      await onCallback(null, mockContext, mockSession);

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            name: "test@example.com",
          }),
        })
      );
    });
  });
});