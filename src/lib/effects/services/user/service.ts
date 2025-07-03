import { Effect, Context, Layer, Schema } from "effect";
import type { User as PrismaUser } from "@prisma/client";
import { DatabaseService } from "../database";
import { DatabaseServiceLive } from "../database/service";
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../errors";
import {
  CreateUserSchema,
  UpdateUserSchema,
  Auth0UserSchema,
  UserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
  type Auth0User,
} from "./schemas";

// UserServiceのインターフェース
export interface UserServiceType {
  readonly create: (
    input: CreateUserInput,
  ) => Effect.Effect<User, ValidationError | ConflictError | DatabaseError>;
  readonly findById: (
    id: string,
  ) => Effect.Effect<User, NotFoundError | DatabaseError>;
  readonly findByAuth0Id: (
    auth0Id: string,
  ) => Effect.Effect<User, NotFoundError | DatabaseError>;
  readonly findByEmail: (
    email: string,
  ) => Effect.Effect<User, NotFoundError | DatabaseError>;
  readonly update: (
    input: UpdateUserInput,
  ) => Effect.Effect<User, ValidationError | NotFoundError | DatabaseError>;
  readonly createOrUpdateFromAuth0: (
    auth0User: Auth0User,
  ) => Effect.Effect<User, ValidationError | DatabaseError>;
}

// UserServiceのタグ
export class UserService extends Context.Tag("UserService")<
  UserService,
  UserServiceType
>() {}

// PrismaのUserをアプリケーションのUserに変換
const transformUser = (user: PrismaUser): User => {
  const parsed = Schema.decodeUnknownSync(UserSchema)({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
  return parsed;
};

// UserServiceの実装
const make = Effect.gen(function* () {
  const database = yield* DatabaseService;

  const create = (input: CreateUserInput) =>
    Effect.gen(function* () {
      // 入力検証
      const validated = yield* Schema.decodeUnknown(CreateUserSchema)(
        input,
      ).pipe(
        Effect.mapError(
          (error) =>
            new ValidationError({
              field: "input",
              message: error.message,
            }),
        ),
      );

      // 既存ユーザーのチェック
      const existingUser = yield* Effect.tryPromise({
        try: () =>
          database.client.user.findFirst({
            where: {
              OR: [{ auth0Id: validated.auth0Id }, { email: validated.email }],
            },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to check existing user",
            cause: error,
          }),
      });

      if (existingUser) {
        return yield* Effect.fail(
          new ConflictError({
            resource: "User",
            message: "User with this auth0Id or email already exists",
          }),
        );
      }

      // ユーザー作成
      const user = yield* Effect.tryPromise({
        try: () =>
          database.client.user.create({
            data: validated,
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to create user",
            cause: error,
          }),
      });

      return transformUser(user);
    });

  const findById = (id: string) =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () =>
          database.client.user.findUnique({
            where: { id },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find user",
            cause: error,
          }),
      });

      if (!user) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "User",
            id,
          }),
        );
      }

      return transformUser(user);
    });

  const findByAuth0Id = (auth0Id: string) =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () =>
          database.client.user.findUnique({
            where: { auth0Id },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find user by auth0Id",
            cause: error,
          }),
      });

      if (!user) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "User",
            id: `auth0Id:${auth0Id satisfies string}`,
          }),
        );
      }

      return transformUser(user);
    });

  const findByEmail = (email: string) =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () =>
          database.client.user.findUnique({
            where: { email },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find user by email",
            cause: error,
          }),
      });

      if (!user) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "User",
            id: `email:${email satisfies string}`,
          }),
        );
      }

      return transformUser(user);
    });

  const update = (input: UpdateUserInput) =>
    Effect.gen(function* () {
      // 入力検証
      const validated = yield* Schema.decodeUnknown(UpdateUserSchema)(
        input,
      ).pipe(
        Effect.mapError(
          (error) =>
            new ValidationError({
              field: "input",
              message: error.message,
            }),
        ),
      );

      // 既存ユーザーの確認
      yield* findById(validated.id);

      // 更新実行
      const user = yield* Effect.tryPromise({
        try: () =>
          database.client.user.update({
            where: { id: validated.id },
            data: {
              name: validated.name,
            },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to update user",
            cause: error,
          }),
      });

      return transformUser(user);
    });

  const createOrUpdateFromAuth0 = (auth0User: Auth0User) =>
    Effect.gen(function* () {
      // Auth0ユーザー情報の検証
      const validated = yield* Schema.decodeUnknown(Auth0UserSchema)(
        auth0User,
      ).pipe(
        Effect.mapError(
          (error) =>
            new ValidationError({
              field: "auth0User",
              message: error.message,
            }),
        ),
      );

      // 既存ユーザーを検索
      const existingUser = yield* Effect.tryPromise({
        try: () =>
          database.client.user.findUnique({
            where: { auth0Id: validated.sub },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find existing user",
            cause: error,
          }),
      });

      if (existingUser) {
        // 既存ユーザーの更新
        const user = yield* Effect.tryPromise({
          try: () =>
            database.client.user.update({
              where: { id: existingUser.id },
              data: {
                email: validated.email,
                name: validated.name,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to update user from Auth0",
              cause: error,
            }),
        });
        return transformUser(user);
      } else {
        // 新規ユーザーの作成
        const user = yield* Effect.tryPromise({
          try: () =>
            database.client.user.create({
              data: {
                auth0Id: validated.sub,
                email: validated.email,
                name: validated.name,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to create user from Auth0",
              cause: error,
            }),
        });
        return transformUser(user);
      }
    });

  return {
    create,
    findById,
    findByAuth0Id,
    findByEmail,
    update,
    createOrUpdateFromAuth0,
  } satisfies UserServiceType;
});

// UserServiceのLayer
const UserServiceLive = Layer.effect(UserService, make).pipe(
  Layer.provide(DatabaseServiceLive),
);

export { UserServiceLive };
