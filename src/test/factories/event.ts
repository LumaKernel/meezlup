import { Schema } from "effect";
import type { Event } from "@/lib/effects";
import {
  EventId,
  NonEmptyString,
  DateTimeString,
  UserId,
  EmailString,
} from "@/lib/effects";

export const EventFactory = {
  create: (overrides: Partial<Event> = {}): Event => ({
    id: Schema.decodeUnknownSync(EventId)("event123"),
    name: Schema.decodeUnknownSync(NonEmptyString)("テストイベント"),
    description: "テストイベントの説明",
    dateRangeStart: Schema.decodeUnknownSync(DateTimeString)(
      "2024-03-01T00:00:00.000Z",
    ),
    dateRangeEnd: Schema.decodeUnknownSync(DateTimeString)(
      "2024-03-03T00:00:00.000Z",
    ),
    timeSlotDuration: 30,
    deadline: null,
    creatorId: Schema.decodeUnknownSync(UserId)("user123"),
    participantRestrictionType: "none",
    allowedDomains: [],
    allowedEmails: [],
    creatorCanSeeEmails: true,
    participantsCanSeeEach: true,
    createdAt: Schema.decodeUnknownSync(DateTimeString)(
      "2024-01-01T00:00:00.000Z",
    ),
    updatedAt: Schema.decodeUnknownSync(DateTimeString)(
      "2024-01-01T00:00:00.000Z",
    ),
    isLinkOnly: false,
    ...overrides,
  }),

  withPrivacy: (overrides: Partial<Event> = {}): Event =>
    EventFactory.create({
      creatorCanSeeEmails: false,
      participantsCanSeeEach: false,
      ...overrides,
    }),

  withDeadline: (deadline: string, overrides: Partial<Event> = {}): Event =>
    EventFactory.create({
      deadline: Schema.decodeUnknownSync(DateTimeString)(deadline),
      ...overrides,
    }),

  withRestrictions: (
    type: "domain" | "specific_users",
    restrictions: ReadonlyArray<string>,
    overrides: Partial<Event> = {},
  ): Event =>
    EventFactory.create({
      participantRestrictionType: type,
      ...(type === "domain"
        ? {
            allowedDomains: restrictions.map((r) =>
              Schema.decodeUnknownSync(NonEmptyString)(r),
            ),
          }
        : {
            allowedEmails: restrictions.map((r) =>
              Schema.decodeUnknownSync(EmailString)(r),
            ),
          }),
      ...overrides,
    }),
};
