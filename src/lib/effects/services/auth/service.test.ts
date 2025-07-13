import { describe, it, expect } from "@effect/vitest";
import { Effect, Option, Layer, Cause } from "effect";
import {
  AuthService,
  AuthServiceLive,
  Auth0Client,
  PrismaService,
} from "./service";

// Auth0のセッション型を定義
interface Session {
  user: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    nickname?: string;
    email_verified?: boolean;
    [key: string]: unknown;
  };
}

// テスト用データ
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

describe("AuthService", () => {
  describe("syncWithAuth0", () => {
    it.effect("新規ユーザーを正常に作成する", () => {
      const mockDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        preferredLanguage: null,
      };

      // Auth0のモックレイヤー
      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(testSession),
      });

      // Prismaのモックレイヤー
      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.resolve(mockDbUser),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      // AuthServiceのテスト用レイヤーを作成
      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.syncWithAuth0(testSession);

        expect(result.id).toBe("auth0|test123");
        expect(result.email).toBe("test@example.com");
        expect(result.name).toBe("Test User");
      }).pipe(Effect.provide(TestLayer));
    });

    it.effect("既存ユーザーを正常に更新する", () => {
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
        preferredLanguage: null,
      };

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.resolve(mockDbUser),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(
          Layer.succeed(Auth0Client, {
            getSession: () => Promise.resolve(updatedSession),
          }),
        ),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.syncWithAuth0(updatedSession);

        expect(result.name).toBe("Updated Name");
        expect(result.updatedAt).toBeDefined();
      }).pipe(Effect.provide(TestLayer));
    });

    it.effect("データベースエラー時に適切なエラーを返す", () => {
      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Database error")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(
          Layer.succeed(Auth0Client, {
            getSession: () => Promise.resolve(testSession),
          }),
        ),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* Effect.exit(
          authService.syncWithAuth0(testSession),
        );

        expect(result._tag).toBe("Failure");
        if (result._tag === "Failure") {
          // エラー構造を確認
          const failures = Cause.failures(result.cause);
          const defects = Cause.defects(result.cause);

          // エラーが存在することを確認
          expect(failures.length + defects.length).toBeGreaterThan(0);

          // エラーメッセージを確認
          const errorMessages = [...failures, ...defects].map((e) => {
            if (typeof e === "object" && e !== null && "message" in e) {
              return String(e.message);
            }
            return JSON.stringify(e);
          });
          const hasExpectedMessage = errorMessages.some((msg) =>
            msg.includes("データベースとの同期に失敗しました"),
          );
          expect(hasExpectedMessage).toBe(true);
        }
      }).pipe(Effect.provide(TestLayer));
    });

    it.effect("ユーザー名がない場合はnicknameまたはemailを使用する", () => {
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
        preferredLanguage: null,
      };

      let upsertArgs: {
        where: { auth0Id: string };
        update: { email: string; name: string; updatedAt: Date };
        create: { auth0Id: string; email: string; name: string };
      } | null = null;

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: (args) => {
            upsertArgs = args;
            return Promise.resolve(mockDbUser);
          },
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(
          Layer.succeed(Auth0Client, {
            getSession: () => Promise.resolve(sessionWithoutName),
          }),
        ),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        yield* authService.syncWithAuth0(sessionWithoutName);

        expect(upsertArgs).not.toBeNull();
        if (upsertArgs !== null) {
          expect(upsertArgs.create.name).toBe("testuser");
        }
      }).pipe(Effect.provide(TestLayer));
    });
  });

  describe("updateUser", () => {
    it.effect("認証されていない場合はエラーを返す", () => {
      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(null),
      });

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Should not be called")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* Effect.exit(
          authService.updateUser("auth0|test123" as never, {
            name: "Updated Name",
          }),
        );

        expect(result._tag).toBe("Failure");
        if (result._tag === "Failure") {
          // エラー構造を確認
          const failures = Cause.failures(result.cause);
          const defects = Cause.defects(result.cause);

          // エラーが存在することを確認
          expect(failures.length + defects.length).toBeGreaterThan(0);

          // エラーメッセージを確認
          const errorMessages = [...failures, ...defects].map((e) => {
            if (typeof e === "object" && e !== null && "message" in e) {
              return String(e.message);
            }
            return JSON.stringify(e);
          });
          const hasExpectedMessage = errorMessages.some((msg) =>
            msg.includes("認証されていません"),
          );
          expect(hasExpectedMessage).toBe(true);
        }
      }).pipe(Effect.provide(TestLayer));
    });

    it.effect("認証済みユーザーの情報を正常に更新する", () => {
      const mockUpdatedDbUser = {
        id: "user123",
        auth0Id: "auth0|test123",
        email: "test@example.com",
        name: "Updated Name",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
        preferredLanguage: null,
      };

      let updateArgs: {
        where: { auth0Id: string };
        data: { name?: string; email?: string; updatedAt: Date };
      } | null = null;

      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(testSession),
      });

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Should not be called")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: (args) => {
            updateArgs = args;
            return Promise.resolve(mockUpdatedDbUser);
          },
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.updateUser("auth0|test123" as never, {
          name: "Updated Name",
        });

        expect(updateArgs).not.toBeNull();
        if (updateArgs !== null) {
          expect(updateArgs.where.auth0Id).toBe("auth0|test123");
          expect(updateArgs.data.name).toBe("Updated Name");
          expect(updateArgs.data.updatedAt).toBeInstanceOf(Date);
        }

        expect(result.name).toBe("Updated Name");
      }).pipe(Effect.provide(TestLayer));
    });
  });

  describe("getCurrentAuthState", () => {
    it.effect("認証済みユーザーの状態を正常に返す", () => {
      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(testSession),
      });

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Should not be called")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.getCurrentAuthState;

        expect(result.isAuthenticated).toBe(true);
        if (result.user && "email" in result.user) {
          expect(result.user.email).toBe("test@example.com");
          expect(result.user.name).toBe("Test User");
        }
      }).pipe(Effect.provide(TestLayer));
    });

    it.effect("未認証ユーザーの場合は匿名ユーザー状態を返す", () => {
      // localStorageのモック
      const originalLocalStorage = global.localStorage;
      const mockLocalStorage = {
        getItem: () => "test-session-id",
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };
      Object.defineProperty(global, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });

      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(null),
      });

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Should not be called")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.getCurrentAuthState;

        expect(result.isAuthenticated).toBe(false);
        if (result.user && "isAnonymous" in result.user) {
          expect(result.user.isAnonymous).toBe(true);
          expect(result.user.sessionId).toBe("test-session-id");
        }

        // クリーンアップ
        Object.defineProperty(global, "localStorage", {
          value: originalLocalStorage,
          writable: true,
          configurable: true,
        });
      }).pipe(Effect.provide(TestLayer));
    });
  });

  describe("getAuthenticatedUser", () => {
    it.effect("認証済みユーザーの場合はユーザー情報を返す", () => {
      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(testSession),
      });

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Should not be called")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.getAuthenticatedUser;

        expect(Option.isSome(result)).toBe(true);
        if (Option.isSome(result)) {
          expect(result.value.email).toBe("test@example.com");
        }
      }).pipe(Effect.provide(TestLayer));
    });

    it.effect("未認証ユーザーの場合はNoneを返す", () => {
      const Auth0TestLayer = Layer.succeed(Auth0Client, {
        getSession: () => Promise.resolve(null),
      });

      const PrismaTestLayer = Layer.succeed(PrismaService, {
        user: {
          upsert: () => Promise.reject(new Error("Should not be called")),
          create: () => Promise.reject(new Error("Should not be called")),
          update: () => Promise.reject(new Error("Should not be called")),
          findUnique: () => Promise.reject(new Error("Should not be called")),
        },
        $disconnect: () => Promise.resolve(),
      });

      const TestLayer = AuthServiceLive.pipe(
        Layer.provide(Auth0TestLayer),
        Layer.provide(PrismaTestLayer),
      );

      return Effect.gen(function* () {
        const authService = yield* AuthService;
        const result = yield* authService.getAuthenticatedUser;

        expect(Option.isNone(result)).toBe(true);
      }).pipe(Effect.provide(TestLayer));
    });
  });
});
