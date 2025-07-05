import { Effect, Context, Schema, Option } from "effect";
import type {
  AuthenticatedUser,
  AnonymousUser,
  AuthState,
  UserId,
} from "./schemas";
import { AuthenticatedUserSchema, AnonymousUserSchema } from "./schemas";
import { type DatabaseError } from "@/lib/effects/errors";
import { auth0 } from "@/lib/auth0";
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

/**
 * 認証エラー
 */
export class AuthError extends Schema.TaggedError<AuthError>()(
  "AuthError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  },
) {}

/**
 * 認証サービスインターフェース
 */
export interface AuthService {
  /**
   * 現在の認証状態を取得
   */
  readonly getCurrentAuthState: Effect.Effect<AuthState, AuthError>;

  /**
   * 認証済みユーザーを取得
   */
  readonly getAuthenticatedUser: Effect.Effect<
    Option.Option<AuthenticatedUser>,
    AuthError
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
export const AuthServiceLive = Effect.gen(function* () {
  const getCurrentAuthState = Effect.gen(function* () {
    try {
      // Auth0セッションを取得
      const session = yield* Effect.tryPromise({
        try: () => auth0.getSession(),
        catch: (error) =>
          new AuthError({
            message: "セッション取得に失敗しました",
            cause: error,
          }),
      });

      if (session?.user) {
        // 認証済みユーザー
        const user = yield* Effect.try({
          try: () =>
            Schema.decodeUnknownSync(AuthenticatedUserSchema)({
              id: session.user.sub,
              email: session.user.email,
              name: session.user.name,
              picture: session.user.picture,
              nickname: session.user.nickname,
              emailVerified: session.user.email_verified,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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
          sessionId: session.user.sid || generateSessionId(),
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
    } catch (error) {
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
    if (authState.isAuthenticated && authState.user && "email" in authState.user) {
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
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          
          try {
            return await prisma.user.update({
              where: { auth0Id: userId },
              data: {
                email: data.email,
                name: data.name,
                updatedAt: new Date(),
              },
            });
          } finally {
            await prisma.$disconnect();
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
        id: updatedDbUser.auth0Id as UserId,
        email: updatedDbUser.email,
        name: updatedDbUser.name,
        picture: currentUser.value.picture,
        nickname: currentUser.value.nickname,
        emailVerified: currentUser.value.emailVerified,
        createdAt: updatedDbUser.createdAt.toISOString(),
        updatedAt: updatedDbUser.updatedAt.toISOString(),
      };

      return yield* Effect.try({
        try: () => Schema.decodeUnknownSync(AuthenticatedUserSchema)(updatedUser),
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
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          
          try {
            const userData = {
              auth0Id: session.user.sub,
              email: session.user.email,
              name: session.user.name || session.user.nickname || session.user.email,
            };

            return await prisma.user.upsert({
              where: { auth0Id: userData.auth0Id },
              update: {
                email: userData.email,
                name: userData.name,
                updatedAt: new Date(),
              },
              create: userData,
            });
          } finally {
            await prisma.$disconnect();
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
        id: session.user.sub as UserId,
        email: session.user.email,
        name: session.user.name || session.user.nickname || session.user.email,
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
 * セッションID生成
 */
function generateSessionId(): string {
  return `session_${Date.now() satisfies number}_${Math.random().toString(36).substring(2, 11) satisfies string}`;
}