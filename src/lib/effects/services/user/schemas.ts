import { Schema } from "effect";
import {
  EmailString,
  NonEmptyString,
  UserId,
  DateTimeString,
} from "../../types";

// 言語設定のスキーマ
export const LanguageSchema = Schema.Union(
  Schema.Literal("ja"),
  Schema.Literal("en"),
);

// ユーザー作成のスキーマ
export const CreateUserSchema = Schema.Struct({
  auth0Id: NonEmptyString,
  email: EmailString,
  name: Schema.optional(NonEmptyString),
  preferredLanguage: Schema.optional(LanguageSchema),
});

// ユーザー更新のスキーマ
export const UpdateUserSchema = Schema.Struct({
  id: UserId,
  name: Schema.optional(NonEmptyString),
  preferredLanguage: Schema.optional(LanguageSchema),
});

// ユーザー取得のスキーマ
export const UserSchema = Schema.Struct({
  id: UserId,
  auth0Id: NonEmptyString,
  email: EmailString,
  name: Schema.NullOr(NonEmptyString),
  preferredLanguage: Schema.NullOr(LanguageSchema),
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

// 言語設定更新のスキーマ
export const UpdateUserLanguageSchema = Schema.Struct({
  id: UserId,
  preferredLanguage: LanguageSchema,
});

// 型エクスポート
export type Language = Schema.Schema.Type<typeof LanguageSchema>;
export type CreateUserInput = Schema.Schema.Type<typeof CreateUserSchema>;
export type UpdateUserInput = Schema.Schema.Type<typeof UpdateUserSchema>;
export type UpdateUserLanguageInput = Schema.Schema.Type<
  typeof UpdateUserLanguageSchema
>;
export type User = Schema.Schema.Type<typeof UserSchema>;
export type Auth0User = Schema.Schema.Type<typeof Auth0UserSchema>;
