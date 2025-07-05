import { Effect, Context, Schema, Option } from "effect";
import type {
  AuthenticatedUser,
  AnonymousUser,
  User,
  AuthState,
  UserId,
} from "./schemas";
import { AuthenticatedUserSchema, AnonymousUserSchema } from "./schemas";
import { type DatabaseError } from "@/lib/effects/errors";
import type { Session } from "@auth0/nextjs-auth0";
import { getSession } from "@auth0/nextjs-auth0";

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
        try: () => getSession(),
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
      // TODO: データベース更新ロジックを実装
      const currentUser = yield* getAuthenticatedUser;
      if (Option.isNone(currentUser)) {
        return yield* Effect.fail(
          new AuthError({
            message: "認証されていません",
          }),
        );
      }

      const updatedUser = {
        ...currentUser.value,
        ...data,
        updatedAt: new Date().toISOString() as any,
      };

      return yield* Effect.try({
        try: () => Schema.decodeUnknownSync(AuthenticatedUserSchema)(updatedUser),
        catch: (error) =>
          new AuthError({
            message: "ユーザー情報の更新に失敗しました",
            cause: error,
          }),
      });
    });

  const syncWithAuth0 = (session: Session) =>
    Effect.gen(function* () {
      const userData = {
        id: session.user.sub as UserId,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
        nickname: session.user.nickname,
        emailVerified: session.user.email_verified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return yield* Effect.try({
        try: () => Schema.decodeUnknownSync(AuthenticatedUserSchema)(userData),
        catch: (error) =>
          new AuthError({
            message: "Auth0ユーザー情報の同期に失敗しました",
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
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}