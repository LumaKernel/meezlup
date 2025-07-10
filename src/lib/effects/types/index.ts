import { Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { Temporal } from "temporal-polyfill";

// スキーマのエラー型
export type SchemaError = ParseError;

// 共通の型定義
export const DateTimeString = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/),
  Schema.brand("DateTimeString"),
);

// Temporal.PlainDateの文字列表現
export const PlainDateString = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}$/),
  Schema.brand("PlainDateString"),
);

// Temporal型のスキーマ
export const PlainDateSchema = Schema.instanceOf(Temporal.PlainDate);
export const PlainDateTimeSchema = Schema.instanceOf(Temporal.PlainDateTime);
export const ZonedDateTimeSchema = Schema.instanceOf(Temporal.ZonedDateTime);

export const EmailString = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.brand("EmailString"),
);

export const NonEmptyString = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("NonEmptyString"),
);

export const PositiveInt = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.brand("PositiveInt"),
);

// 参加制限タイプ
export const ParticipantRestrictionType = Schema.Literal(
  "none",
  "login_required",
  "domain",
  "specific_users",
);

// 時間帯幅
export const TimeSlotDuration = Schema.Literal(15, 30, 60);

// ID型
export const EventId = Schema.String.pipe(Schema.brand("EventId"));
export const UserId = Schema.String.pipe(Schema.brand("UserId"));
export const ScheduleId = Schema.String.pipe(Schema.brand("ScheduleId"));
export const AvailabilityId = Schema.String.pipe(
  Schema.brand("AvailabilityId"),
);
