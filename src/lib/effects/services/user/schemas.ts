import { Schema } from "effect";
import {
  EmailString,
  NonEmptyString,
  UserId,
  DateTimeString,
} from "../../types";

// ユーザー作成のスキーマ
export const CreateUserSchema = Schema.Struct({
  auth0Id: NonEmptyString,
  email: EmailString,
  name: Schema.optional(NonEmptyString),
});

// ユーザー更新のスキーマ
export const UpdateUserSchema = Schema.Struct({
  id: UserId,
  name: Schema.optional(NonEmptyString),
});

// ユーザー取得のスキーマ
export const UserSchema = Schema.Struct({
  id: UserId,
  auth0Id: NonEmptyString,
  email: EmailString,
  name: Schema.NullOr(NonEmptyString),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

// Auth0からのユーザー情報スキーマ
export const Auth0UserSchema = Schema.Struct({
  sub: NonEmptyString, // auth0Id
  email: EmailString,
  name: Schema.optional(NonEmptyString),
  email_verified: Schema.optional(Schema.Boolean),
});

// 型エクスポート
export type CreateUserInput = Schema.Schema.Type<typeof CreateUserSchema>;
export type UpdateUserInput = Schema.Schema.Type<typeof UpdateUserSchema>;
export type User = Schema.Schema.Type<typeof UserSchema>;
export type Auth0User = Schema.Schema.Type<typeof Auth0UserSchema>;
