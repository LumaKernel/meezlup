/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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

// Auth0とNextResponseのモック
let mockOnCallback: any;
const mockAuth0Client = vi.fn().mockImplementation((options: any) => {
  mockOnCallback = options.onCallback;
  return {};
});

vi.mock("@auth0/nextjs-auth0/server", () => ({
  Auth0Client: mockAuth0Client,
}));

const mockRedirect = vi.fn();
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: mockRedirect,
  },
}));

describe("Auth0 Callback Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockReset();
    // 環境変数のモック
    process.env.APP_BASE_URL = "http://localhost:5825";
    // auth0.tsを再インポートして新しいインスタンスを作成
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("onCallback", () => {
    it("正常なログイン後にユーザーをデータベースに保存し、リダイレクトする", async () => {
      // auth0.tsをインポートして初期化
      await import("./auth0");

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

      // Auth0Client が呼ばれたことを確認
      expect(mockAuth0Client).toHaveBeenCalled();
      expect(mockOnCallback).toBeDefined();

      // onCallbackを実行
      const result = await mockOnCallback(null, mockContext, mockSession);

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

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("http://localhost:5825/dashboard"),
        }),
      );
    });

    it("エラー発生時はエラーページにリダイレクトする", async () => {
      await import("./auth0");

      const mockError = new Error("Auth0 error");
      const mockContext = {};

      const result = await mockOnCallback(mockError, mockContext, null);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("/error?error=Auth0%20error"),
        }),
      );
    });

    it("データベースエラー時もログインを継続し、エラーをログに出力する", async () => {
      await import("./auth0");

      const mockSession = {
        user: {
          sub: "auth0|test123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      const mockContext = {
        returnTo: "/",
      };

      const mockError = new Error("Database error");
      mockPrismaUser.upsert.mockRejectedValue(mockError);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await mockOnCallback(null, mockContext, mockSession);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Database sync error:",
        mockError,
      );

      // エラーが発生してもリダイレクトは実行される
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("http://localhost:5825/"),
        }),
      );

      consoleSpy.mockRestore();
    });

    it("ユーザー名がない場合はnicknameまたはemailを使用する", async () => {
      await import("./auth0");

      const mockSession = {
        user: {
          sub: "auth0|test456",
          email: "test2@example.com",
          nickname: "testuser2",
          // nameは含まれていない
        },
      };

      const mockContext = {};

      const mockDbUser = {
        id: "user456",
        auth0Id: "auth0|test456",
        email: "test2@example.com",
        name: "testuser2",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      await mockOnCallback(null, mockContext, mockSession);

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            name: "testuser2", // nicknameが使われている
          }),
        }),
      );
    });

    it("nameもnicknameもない場合はemailを使用する", async () => {
      await import("./auth0");

      const mockSession = {
        user: {
          sub: "auth0|test789",
          email: "test3@example.com",
          // nameもnicknameも含まれていない
        },
      };

      const mockContext = {};

      const mockDbUser = {
        id: "user789",
        auth0Id: "auth0|test789",
        email: "test3@example.com",
        name: "test3@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      await mockOnCallback(null, mockContext, mockSession);

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            name: "test3@example.com", // emailが使われている
          }),
        }),
      );
    });
  });
});
