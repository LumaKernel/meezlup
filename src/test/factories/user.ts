import { Schema } from "effect";
import type { User } from "@/lib/effects";
import { UserId, NonEmptyString, EmailString, DateTimeString } from "@/lib/effects";

export const UserFactory = {
  create: (overrides: Partial<User> = {}): User => ({
    id: Schema.decodeUnknownSync(UserId)("user123"),
    email: Schema.decodeUnknownSync(EmailString)("test@example.com"),
    name: Schema.decodeUnknownSync(NonEmptyString)("テストユーザー"),
    auth0Id: Schema.decodeUnknownSync(NonEmptyString)("auth0|123456"),
    createdAt: Schema.decodeUnknownSync(DateTimeString)("2024-01-01T00:00:00.000Z"),
    updatedAt: Schema.decodeUnknownSync(DateTimeString)("2024-01-01T00:00:00.000Z"),
    preferredLanguage: "ja",
    ...overrides,
  }),
  
  anonymous: (): null => null,
  
  // Auth0から返される形式のユーザー
  auth0User: (overrides: Record<string, unknown> = {}) => ({
    id: "user123",
    sub: "auth0|123456",
    email: "test@example.com",
    name: "テストユーザー",
    picture: "https://example.com/avatar.jpg",
    nickname: "testuser",
    email_verified: true,
    ...overrides,
  }),
  
  // useAuthフックで使われる形式
  authUser: (overrides: Record<string, unknown> = {}) => ({
    id: "user123",
    name: "テストユーザー",
    email: "test@example.com",
    ...overrides,
  }),
};