import { Effect, Context, Schema, Option, Layer } from "effect";
import type { AuthenticatedUser, AnonymousUser, AuthState } from "./schemas";
import {
  AuthenticatedUserSchema,
  AnonymousUserSchema,
  UserId,
} from "./schemas";
import { DatabaseError, AuthError } from "@/lib/effects/errors";

// Auth0のセッション型を定義
interface Session {
  user: {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    nickname?: string;
    email_verified?: boolean;
    sid?: string;
    [key: string]: unknown;
  };
}

// Auth0依存性のタグ定義
export class Auth0Client extends Context.Tag("Auth0Client")<
  Auth0Client,
  {
    readonly getSession: () => Promise<Session | null>;
  }
>() {}

// Prisma依存性のタグ定義
export class PrismaService extends Context.Tag("PrismaService")<
  PrismaService,
  {
    readonly user: {
      readonly upsert: (args: {
        where: { auth0Id: string };
        update: { email: string; name: string; updatedAt: Date };
        create: { auth0Id: string; email: string; name: string };
      }) => Promise<{
        id: string;
        auth0Id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        preferredLanguage: string | null;
      }>;
      readonly create: (args: {
        data: { auth0Id: string; email: string; name: string };
      }) => Promise<{
        id: string;
        auth0Id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        preferredLanguage: string | null;
      }>;
      readonly update: (args: {
        where: { auth0Id: string };
        data: { name?: string; email?: string; updatedAt: Date };
      }) => Promise<{
        id: string;
        auth0Id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        preferredLanguage: string | null;
      }>;
      readonly findUnique: (args: { where: { auth0Id: string } }) => Promise<{
        id: string;
        auth0Id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        preferredLanguage: string | null;
      } | null>;
    };
    readonly $disconnect: () => Promise<void>;
  }
>() {}

/**
 * 認証サービスインターフェース
 */
export interface AuthService {
  /**
   * 現在の認証状態を取得
   */
  readonly getCurrentAuthState: Effect.Effect<
    AuthState,
    AuthError | DatabaseError
  >;

  /**
   * 認証済みユーザーを取得
   */
  readonly getAuthenticatedUser: Effect.Effect<
    Option.Option<AuthenticatedUser>,
    AuthError | DatabaseError
  >;

  /**
   * 匿名ユーザーを作成または取得
   */
  readonly getOrCreateAnonymousUser: Effect.Effect<AnonymousUser, AuthError>;

  /**
   * ユーザー情報を更新
   */
  readonly updateUser: (
    userId: UserId,
    data: Partial<Omit<AuthenticatedUser, "id" | "createdAt">>,
  ) => Effect.Effect<AuthenticatedUser, AuthError | DatabaseError>;

  /**
   * Auth0セッションからユーザーを作成または更新
   */
  readonly syncWithAuth0: (
    session: Session,
  ) => Effect.Effect<AuthenticatedUser, AuthError | DatabaseError>;
}

/**
 * 認証サービスのコンテキストタグ
 */
export const AuthService = Context.GenericTag<AuthService>("AuthService");

/**
 * 認証サービスの実装
 */
const makeAuthService = Effect.gen(function* () {
  const auth0Client = yield* Auth0Client;
  const prismaService = yield* PrismaService;
  const getCurrentAuthState = Effect.gen(function* () {
    try {
      // Auth0セッションを取得
      const session = yield* Effect.tryPromise({
        try: () => auth0Client.getSession(),
        catch: (error) =>
          new AuthError({
            message: "セッション取得に失敗しました",
            cause: error,
          }),
      });

      if (session?.user) {
        // データベースからユーザー情報を取得
        const dbUser = yield* Effect.tryPromise({
          try: async () => {
            try {
              // まず既存のユーザーを確認
              const existingUser = await prismaService.user.findUnique({
                where: { auth0Id: session.user.sub },
              });

              if (!existingUser) {
                // ユーザーが存在しない場合は作成
                const userData = {
                  auth0Id: session.user.sub,
                  email: session.user.email || "",
                  name:
                    session.user.name ||
                    session.user.nickname ||
                    session.user.email ||
                    "",
                };

                return await prismaService.user.create({
                  data: userData,
                });
              }

              return existingUser;
            } finally {
              await prismaService.$disconnect();
            }
          },
          catch: (error) =>
            new DatabaseError({
              message: "データベースとの同期に失敗しました",
              cause: error,
            }),
        });

        // 認証済みユーザー
        const user = yield* Effect.try({
          try: () =>
            Schema.decodeUnknownSync(AuthenticatedUserSchema)({
              id: dbUser.id, // データベースのIDを使用
              email: dbUser.email,
              name: dbUser.name || session.user.name,
              picture: session.user.picture,
              nickname: session.user.nickname,
              emailVerified: session.user.email_verified,
              createdAt: dbUser.createdAt.toISOString(),
              updatedAt: dbUser.updatedAt.toISOString(),
            }),
          catch: (error) =>
            new AuthError({
              message: "ユーザー情報の検証に失敗しました",
              cause: error,
            }),
        });

        return {
          isAuthenticated: true,
          user,
          sessionId: Schema.decodeUnknownOption(Schema.String)(
            session.user.sid,
          ).pipe(Option.getOrElse(() => generateSessionId())),
        };
      } else {
        // 匿名ユーザー
        const anonymousUser = yield* getOrCreateAnonymousUser;
        return {
          isAuthenticated: false,
          user: anonymousUser,
          sessionId: anonymousUser.sessionId,
        };
      }
    } catch {
      // エラーの場合も匿名ユーザーとして扱う
      const anonymousUser = yield* getOrCreateAnonymousUser;
      return {
        isAuthenticated: false,
        user: anonymousUser,
        sessionId: anonymousUser.sessionId,
      };
    }
  });

  const getAuthenticatedUser = Effect.gen(function* () {
    const authState = yield* getCurrentAuthState;
    if (authState.isAuthenticated && "email" in authState.user) {
      // authState.userは既にデコード済みなので、そのまま返す
      return Option.some(authState.user);
    }
    return Option.none();
  });

  const getOrCreateAnonymousUser = Effect.gen(function* () {
    // ローカルストレージからセッションIDを取得または生成
    const sessionId = yield* Effect.sync(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("anonymous_session_id");
        if (stored) return stored;
        const newId = generateSessionId();
        localStorage.setItem("anonymous_session_id", newId);
        return newId;
      }
      return generateSessionId();
    });

    return Schema.decodeUnknownSync(AnonymousUserSchema)({
      id: "anonymous",
      isAnonymous: true,
      sessionId,
      createdAt: new Date().toISOString(),
    });
  });

  const updateUser = (
    userId: UserId,
    data: Partial<Omit<AuthenticatedUser, "id" | "createdAt">>,
  ) =>
    Effect.gen(function* () {
      const currentUser = yield* getAuthenticatedUser;
      if (Option.isNone(currentUser)) {
        return yield* Effect.fail(
          new AuthError({
            message: "認証されていません",
          }),
        );
      }

      // データベースを更新
      const updatedDbUser = yield* Effect.tryPromise({
        try: async () => {
          try {
            return await prismaService.user.update({
              where: { auth0Id: userId },
              data: {
                ...(data.email ? { email: data.email } : {}),
                ...(data.name ? { name: data.name } : {}),
                updatedAt: new Date(),
              },
            });
          } finally {
            await prismaService.$disconnect();
          }
        },
        catch: (error) =>
          new AuthError({
            message: "ユーザー情報の更新に失敗しました",
            cause: error,
          }),
      });

      // 更新されたユーザー情報を返す
      const updatedUser = {
        id: Schema.decodeUnknownSync(UserId)(updatedDbUser.auth0Id),
        email: updatedDbUser.email,
        name: updatedDbUser.name || currentUser.value.name,
        picture: currentUser.value.picture,
        nickname: currentUser.value.nickname,
        emailVerified: currentUser.value.emailVerified,
        createdAt: updatedDbUser.createdAt.toISOString(),
        updatedAt: updatedDbUser.updatedAt.toISOString(),
      };

      return yield* Effect.try({
        try: () =>
          Schema.decodeUnknownSync(AuthenticatedUserSchema)(updatedUser),
        catch: (error) =>
          new AuthError({
            message: "ユーザー情報の変換に失敗しました",
            cause: error,
          }),
      });
    });

  const syncWithAuth0 = (session: Session) =>
    Effect.gen(function* () {
      // データベースにユーザー情報を保存または更新
      const dbUser = yield* Effect.tryPromise({
        try: async () => {
          try {
            const userData = {
              auth0Id: session.user.sub,
              email: session.user.email || "",
              name:
                session.user.name ||
                session.user.nickname ||
                session.user.email ||
                "",
            };

            return await prismaService.user.upsert({
              where: { auth0Id: userData.auth0Id },
              update: {
                email: userData.email,
                name: userData.name,
                updatedAt: new Date(),
              },
              create: userData,
            });
          } finally {
            await prismaService.$disconnect();
          }
        },
        catch: (error) =>
          new AuthError({
            message: "データベースとの同期に失敗しました",
            cause: error,
          }),
      });

      // AuthenticatedUserSchemaに合わせて返す
      const userData = {
        id: Schema.decodeUnknownSync(UserId)(session.user.sub),
        email: session.user.email || "",
        name:
          dbUser.name ||
          session.user.name ||
          session.user.nickname ||
          session.user.email ||
          "",
        picture: session.user.picture,
        nickname: session.user.nickname,
        emailVerified: session.user.email_verified,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
      };

      return yield* Effect.try({
        try: () => Schema.decodeUnknownSync(AuthenticatedUserSchema)(userData),
        catch: (error) =>
          new AuthError({
            message: "Auth0ユーザー情報の変換に失敗しました",
            cause: error,
          }),
      });
    });

  return {
    getCurrentAuthState,
    getAuthenticatedUser,
    getOrCreateAnonymousUser,
    updateUser,
    syncWithAuth0,
  };
});

/**
 * 認証サービスのレイヤー
 */
export const AuthServiceLive = Layer.effect(AuthService, makeAuthService);

/**
 * 本番環境用のAuth0クライアントレイヤー
 */
export const Auth0ClientLive = Layer.succeed(Auth0Client, {
  getSession: async () => {
    const { auth0 } = await import("@/lib/auth0");
    return auth0.getSession();
  },
});

/**
 * 本番環境用のPrismaサービスレイヤー
 */
export const PrismaServiceLive = Layer.effect(
  PrismaService,
  Effect.gen(function* () {
    const { PrismaClient } = yield* Effect.tryPromise({
      try: () => import("@prisma/client"),
      catch: () => new Error("Failed to import PrismaClient"),
    });
    const prisma = new PrismaClient();
    return {
      user: prisma.user,
      $disconnect: () => prisma.$disconnect(),
    };
  }),
);

/**
 * 本番環境用の完全なレイヤー
 */
export const AuthServiceLiveFull = AuthServiceLive.pipe(
  Layer.provide(Auth0ClientLive),
  Layer.provide(PrismaServiceLive),
);

/**
 * セッションID生成
 */
function generateSessionId(): string {
  return `session_${Date.now() satisfies number}_${Math.random().toString(36).substring(2, 11) satisfies string}`;
}
