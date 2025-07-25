import { Effect, Context, Layer, Schema } from "effect";
import type { Event as PrismaEvent } from "@prisma/client";
import { DatabaseService } from "../database";
import { DatabaseServiceLive } from "../database/service";
import { DatabaseError, NotFoundError, ValidationError } from "../../errors";
import {
  CreateEventSchema,
  UpdateEventSchema,
  EventSchema,
  type CreateEventInput,
  type UpdateEventInput,
  type Event,
} from "./schemas";

// EventServiceのインターフェース
export interface EventServiceType {
  readonly create: (
    input: CreateEventInput,
  ) => Effect.Effect<Event, ValidationError | DatabaseError>;
  readonly findById: (
    id: string,
  ) => Effect.Effect<Event, NotFoundError | DatabaseError>;
  readonly update: (
    input: UpdateEventInput,
  ) => Effect.Effect<Event, ValidationError | NotFoundError | DatabaseError>;
  readonly delete: (
    id: string,
  ) => Effect.Effect<void, NotFoundError | DatabaseError>;
  readonly listByCreator: (
    creatorId: string,
  ) => Effect.Effect<ReadonlyArray<Event>, DatabaseError>;
}

// EventServiceのタグ
export class EventService extends Context.Tag("EventService")<
  EventService,
  EventServiceType
>() {}

// PrismaのEventをアプリケーションのEventに変換
const transformEvent = (event: PrismaEvent): Event => {
  const parsed = Schema.decodeUnknownSync(EventSchema)({
    ...event,
    dateRangeStart: event.dateRangeStart.toISOString(),
    dateRangeEnd: event.dateRangeEnd.toISOString(),
    deadline: event.deadline?.toISOString() ?? null,
    allowedDomains: JSON.parse(event.allowedDomains) as Array<string>,
    allowedEmails: JSON.parse(event.allowedEmails) as Array<string>,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  });
  return parsed;
};

// EventServiceの実装
const make = Effect.gen(function* () {
  const database = yield* DatabaseService;

  const create = (input: CreateEventInput) =>
    Effect.gen(function* () {
      // 入力検証
      const validated = yield* Schema.decodeUnknown(CreateEventSchema)(
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

      // データベースに保存
      const event = yield* Effect.tryPromise({
        try: () =>
          database.client.event.create({
            data: {
              ...validated,
              dateRangeStart: new Date(validated.dateRangeStart),
              dateRangeEnd: new Date(validated.dateRangeEnd),
              deadline: validated.deadline
                ? new Date(validated.deadline)
                : undefined,
              allowedDomains: JSON.stringify(validated.allowedDomains),
              allowedEmails: JSON.stringify(validated.allowedEmails),
            },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to create event",
            cause: error,
          }),
      });

      return transformEvent(event);
    });

  const findById = (id: string) =>
    Effect.gen(function* () {
      const event = yield* Effect.tryPromise({
        try: () =>
          database.client.event.findUnique({
            where: { id },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to find event",
            cause: error,
          }),
      });

      if (!event) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "Event",
            id,
          }),
        );
      }

      return transformEvent(event);
    });

  const update = (input: UpdateEventInput) =>
    Effect.gen(function* () {
      // 入力検証
      const validated = yield* Schema.decodeUnknown(UpdateEventSchema)(
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

      // 既存のイベントを確認
      yield* findById(validated.id);

      // 更新データの準備
      const updateData: Record<string, unknown> = {};
      if (validated.name !== undefined) {
        updateData.name = validated.name satisfies string;
      }
      if (validated.description !== undefined) {
        updateData.description = validated.description;
      }
      if (validated.dateRangeEnd !== undefined) {
        updateData.dateRangeEnd = new Date(validated.dateRangeEnd);
      }
      if (validated.deadline !== undefined) {
        updateData.deadline = new Date(validated.deadline);
      }
      if (validated.participantRestrictionType !== undefined)
        updateData.participantRestrictionType =
          validated.participantRestrictionType;
      if (validated.allowedDomains !== undefined)
        updateData.allowedDomains = JSON.stringify(validated.allowedDomains);
      if (validated.allowedEmails !== undefined)
        updateData.allowedEmails = JSON.stringify(validated.allowedEmails);
      if (validated.creatorCanSeeEmails !== undefined)
        updateData.creatorCanSeeEmails = validated.creatorCanSeeEmails;
      if (validated.participantsCanSeeEach !== undefined)
        updateData.participantsCanSeeEach = validated.participantsCanSeeEach;

      // 更新実行
      const event = yield* Effect.tryPromise({
        try: () =>
          database.client.event.update({
            where: { id: validated.id },
            data: updateData,
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to update event",
            cause: error,
          }),
      });

      return transformEvent(event);
    });

  const deleteEvent = (id: string) =>
    Effect.gen(function* () {
      // 既存のイベントを確認
      yield* findById(id);

      // 削除実行
      yield* Effect.tryPromise({
        try: () =>
          database.client.event.delete({
            where: { id },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to delete event",
            cause: error,
          }),
      });
    });

  const listByCreator = (creatorId: string) =>
    Effect.gen(function* () {
      const events = yield* Effect.tryPromise({
        try: () =>
          database.client.event.findMany({
            where: { creatorId },
            orderBy: { createdAt: "desc" },
          }),
        catch: (error) =>
          new DatabaseError({
            message: "Failed to list events",
            cause: error,
          }),
      });

      return events.map(transformEvent);
    });

  return {
    create,
    findById,
    update,
    delete: deleteEvent,
    listByCreator,
  } satisfies EventServiceType;
});

// EventServiceのLayer
const EventServiceLive = Layer.effect(EventService, make).pipe(
  Layer.provide(DatabaseServiceLive),
);

export { EventServiceLive };
