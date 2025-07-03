import { Effect, Context, Layer } from "effect";
import { PrismaClient } from "@prisma/client";
import { DatabaseError } from "../../errors";

// DatabaseServiceのインターフェース
export interface DatabaseServiceType {
  readonly client: PrismaClient;
  readonly transaction: <A, E>(
    effect: (tx: PrismaClient) => Effect.Effect<A, E>,
  ) => Effect.Effect<A, E | DatabaseError>;
}

// DatabaseServiceのタグ
export class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  DatabaseServiceType
>() {}

// PrismaClientの作成
const makePrismaClient = Effect.sync(() => {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
  return client;
});

// DatabaseServiceの実装
const make = Effect.gen(function* () {
  const client = yield* makePrismaClient;

  const transaction = <A, E>(
    effect: (tx: PrismaClient) => Effect.Effect<A, E>,
  ) =>
    Effect.tryPromise({
      try: () =>
        client.$transaction(async (tx) => {
          const result = await Effect.runPromise(effect(tx as PrismaClient));
          return result;
        }),
      catch: (error) =>
        new DatabaseError({
          message: "Transaction failed",
          cause: error,
        }),
    });

  return {
    client,
    transaction,
  } satisfies DatabaseServiceType;
});

// DatabaseServiceのLayer
const DatabaseServiceLive = Layer.effect(DatabaseService, make);
export { DatabaseServiceLive };

// クライアントのクリーンアップ
export const disconnectPrisma = (client: PrismaClient) =>
  Effect.tryPromise({
    try: () => client.$disconnect(),
    catch: (error) =>
      new DatabaseError({
        message: "Failed to disconnect from database",
        cause: error,
      }),
  });
