/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Effect, Option } from "effect";
import { AuthService, AuthServiceLive } from "./service";
// Auth0のセッション型を定義
interface Session {
  user: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    nickname?: string;
    email_verified?: boolean;
    [key: string]: any;
  };
}

// Auth0のモック
vi.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
}));

// Prismaのモック
const mockPrismaUser = {
  upsert: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
};

const mockPrisma = {
  user: mockPrismaUser,
  $disconnect: vi.fn(),
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

describe("AuthService", () => {
  const testSession: Session = {
    user: {
      sub: "auth0|test123",
      email: "test@example.com",
      name: "Test User",
      picture: "https://example.com/avatar.jpg",
      nickname: "testuser",
      email_verified: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("syncWithAuth0", () => {
    it("新規ユーザーを正常に作成する", async () => {
      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.syncWithAuth0(testSession);
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

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

      expect(result.id).toBe("auth0|test123");
      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Test User");
    });

    it("既存ユーザーを正常に更新する", async () => {
      const updatedSession: Session = {
        user: {
          ...testSession.user,
          name: "Updated Name",
        },
      };

      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "Updated Name",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.syncWithAuth0(updatedSession);
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

      expect(result.name).toBe("Updated Name");
      // DateTimeUtcはDateTime.Utc型として返される
      expect(result.updatedAt).toBeDefined();
    });

    it("データベースエラー時に適切なエラーを返す", async () => {
      mockPrismaUser.upsert.mockRejectedValue(new Error("Database error"));

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.syncWithAuth0(testSession);
      });

      await expect(
        Effect.runPromise(Effect.provide(effect, AuthServiceLive)),
      ).rejects.toThrow("データベースとの同期に失敗しました");
    });

    it("ユーザー名がない場合はnicknameまたはemailを使用する", async () => {
      const sessionWithoutName: Session = {
        user: {
          ...testSession.user,
          name: undefined,
          nickname: "testuser",
        },
      };

      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "testuser",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockPrismaUser.upsert.mockResolvedValue(mockDbUser);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.syncWithAuth0(sessionWithoutName);
      });

      await Effect.runPromise(Effect.provide(effect, AuthServiceLive));

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            name: "testuser",
          }),
        }),
      );
    });
  });

  describe("updateUser", () => {
    it("認証されていない場合はエラーを返す", async () => {
      const { auth0 } = await import("@/lib/auth0");
      (auth0.getSession as any).mockResolvedValue(null);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.updateUser("auth0|test123" as any, {
          name: "Updated Name",
        });
      });

      await expect(
        Effect.runPromise(Effect.provide(effect, AuthServiceLive)),
      ).rejects.toThrow("認証されていません");
    });

    it("認証済みユーザーの情報を正常に更新する", async () => {
      const { auth0 } = await import("@/lib/auth0");
      (auth0.getSession as any).mockResolvedValue(testSession);

      const mockUpdatedDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "Updated Name",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
      };

      mockPrismaUser.update.mockResolvedValue(mockUpdatedDbUser);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.updateUser("auth0|test123" as any, {
          name: "Updated Name",
        });
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { auth0Id: "auth0|test123" },
        data: {
          name: "Updated Name",
          updatedAt: expect.any(Date),
        },
      });

      expect(result.name).toBe("Updated Name");
    });
  });

  describe("getCurrentAuthState", () => {
    it("認証済みユーザーの状態を正常に返す", async () => {
      const { auth0 } = await import("@/lib/auth0");
      (auth0.getSession as any).mockResolvedValue(testSession);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.getCurrentAuthState;
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

      expect(result.isAuthenticated).toBe(true);
      if (result.user && "email" in result.user) {
        expect(result.user.email).toBe("test@example.com");
        expect(result.user.name).toBe("Test User");
      }
    });

    it("未認証ユーザーの場合は匿名ユーザー状態を返す", async () => {
      const { auth0 } = await import("@/lib/auth0");
      (auth0.getSession as any).mockResolvedValue(null);

      // localStorageのモック
      const mockLocalStorage = {
        getItem: vi.fn(() => "test-session-id"),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.getCurrentAuthState;
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

      expect(result.isAuthenticated).toBe(false);
      if (result.user && "isAnonymous" in result.user) {
        expect(result.user.isAnonymous).toBe(true);
        expect(result.user.sessionId).toBe("test-session-id");
      }
    });
  });

  describe("getAuthenticatedUser", () => {
    it("認証済みユーザーの場合はユーザー情報を返す", async () => {
      const { auth0 } = await import("@/lib/auth0");
      (auth0.getSession as any).mockResolvedValue(testSession);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.getAuthenticatedUser;
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value.email).toBe("test@example.com");
      }
    });

    it("未認証ユーザーの場合はNoneを返す", async () => {
      const { auth0 } = await import("@/lib/auth0");
      (auth0.getSession as any).mockResolvedValue(null);

      const effect = Effect.gen(function* () {
        const authService = yield* AuthService;
        return yield* authService.getAuthenticatedUser;
      });

      const result = await Effect.runPromise(
        Effect.provide(effect, AuthServiceLive),
      );

      expect(Option.isNone(result)).toBe(true);
    });
  });
});
