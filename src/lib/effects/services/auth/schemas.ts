import { Schema } from "effect";

// ユーザーIDのブランド型
export const UserId = Schema.String.pipe(Schema.brand("UserId"));
export type UserId = Schema.Schema.Type<typeof UserId>;

// 認証済みユーザー
export const AuthenticatedUserSchema = Schema.Struct({
  id: UserId,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  name: Schema.optional(Schema.String),
  picture: Schema.optional(Schema.String.pipe(Schema.pattern(/^https?:\/\//))),
  nickname: Schema.optional(Schema.String),
  emailVerified: Schema.optional(Schema.Boolean),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
});

export type AuthenticatedUser = Schema.Schema.Type<
  typeof AuthenticatedUserSchema
>;

// 匿名ユーザー
export const AnonymousUserSchema = Schema.Struct({
  id: Schema.Literal("anonymous"),
  isAnonymous: Schema.Literal(true),
  sessionId: Schema.String,
  createdAt: Schema.DateTimeUtc,
});

export type AnonymousUser = Schema.Schema.Type<typeof AnonymousUserSchema>;

// ユーザー（認証済み or 匿名）
export const UserSchema = Schema.Union(
  AuthenticatedUserSchema,
  AnonymousUserSchema,
);
export type User = Schema.Schema.Type<typeof UserSchema>;

// 認証状態
export const AuthStateSchema = Schema.Struct({
  isAuthenticated: Schema.Boolean,
  user: Schema.optional(UserSchema),
  sessionId: Schema.String,
});

export type AuthState = Schema.Schema.Type<typeof AuthStateSchema>;

// Auth0トークン
export const Auth0TokenSchema = Schema.Struct({
  accessToken: Schema.String,
  refreshToken: Schema.optional(Schema.String),
  idToken: Schema.String,
  tokenType: Schema.Literal("Bearer"),
  expiresIn: Schema.Number,
  scope: Schema.String,
});

export type Auth0Token = Schema.Schema.Type<typeof Auth0TokenSchema>;
