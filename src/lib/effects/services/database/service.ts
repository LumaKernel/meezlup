import "server-only";
import { Effect, Context, Layer } from "effect";
import type { PrismaClient } from "@prisma/client";
import { prisma as serverlessPrisma } from "@/lib/prisma/serverless";
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

// PrismaClientの作成（サーバーレス対応）
const makePrismaClient = Effect.sync(() => {
  // サーバーレス用のPrismaクライアントを使用
  return serverlessPrisma;
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
