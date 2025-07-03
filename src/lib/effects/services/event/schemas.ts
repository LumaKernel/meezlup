import { Schema } from "effect";
import {
  DateTimeString,
  EmailString,
  EventId,
  NonEmptyString,
  ParticipantRestrictionType,
  TimeSlotDuration,
  UserId,
} from "../../types";

// イベント作成のスキーマ
export const CreateEventSchema = Schema.Struct({
  name: NonEmptyString,
  description: Schema.optional(Schema.String),
  dateRangeStart: DateTimeString,
  dateRangeEnd: DateTimeString,
  timeSlotDuration: TimeSlotDuration,
  deadline: Schema.optional(DateTimeString),
  participantRestrictionType: Schema.optionalWith(ParticipantRestrictionType, { default: () => "none" as const }),
  allowedDomains: Schema.optionalWith(Schema.Array(NonEmptyString), { default: () => [] }),
  allowedEmails: Schema.optionalWith(Schema.Array(EmailString), { default: () => [] }),
  creatorId: Schema.optional(UserId),
  creatorCanSeeEmails: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  participantsCanSeeEach: Schema.optionalWith(Schema.Boolean, { default: () => false }),
});

// イベント更新のスキーマ
export const UpdateEventSchema = Schema.Struct({
  id: EventId,
  name: Schema.optional(NonEmptyString),
  description: Schema.optional(Schema.String),
  dateRangeEnd: Schema.optional(DateTimeString),
  deadline: Schema.optional(DateTimeString),
  participantRestrictionType: Schema.optional(ParticipantRestrictionType),
  allowedDomains: Schema.optional(Schema.Array(NonEmptyString)),
  allowedEmails: Schema.optional(Schema.Array(EmailString)),
  creatorCanSeeEmails: Schema.optional(Schema.Boolean),
  participantsCanSeeEach: Schema.optional(Schema.Boolean),
});

// イベント取得のスキーマ
export const EventSchema = Schema.Struct({
  id: EventId,
  name: NonEmptyString,
  description: Schema.NullOr(Schema.String),
  dateRangeStart: DateTimeString,
  dateRangeEnd: DateTimeString,
  timeSlotDuration: TimeSlotDuration,
  deadline: Schema.NullOr(DateTimeString),
  participantRestrictionType: ParticipantRestrictionType,
  allowedDomains: Schema.Array(NonEmptyString),
  allowedEmails: Schema.Array(EmailString),
  creatorId: Schema.NullOr(UserId),
  creatorCanSeeEmails: Schema.Boolean,
  participantsCanSeeEach: Schema.Boolean,
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

// 型エクスポート
export type CreateEventInput = Schema.Schema.Type<typeof CreateEventSchema>;
export type UpdateEventInput = Schema.Schema.Type<typeof UpdateEventSchema>;
export type Event = Schema.Schema.Type<typeof EventSchema>;