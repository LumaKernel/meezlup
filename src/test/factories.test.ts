import { describe, it, expect } from "vitest";
import {
  EventFactory,
  UserFactory,
  ScheduleFactory,
  AvailabilityFactory,
} from "./factories";

describe("EventFactory", () => {
  it("デフォルトのイベントを作成できる", () => {
    const event = EventFactory.create();

    expect(event.id).toBe("event123");
    expect(event.name).toBe("テストイベント");
    expect(event.description).toBe("テストイベントの説明");
    expect(event.creatorCanSeeEmails).toBe(true);
    expect(event.participantsCanSeeEach).toBe(true);
    expect(event.isLinkOnly).toBe(false);
  });

  it("プライバシー設定付きのイベントを作成できる", () => {
    const event = EventFactory.withPrivacy();

    expect(event.creatorCanSeeEmails).toBe(false);
    expect(event.participantsCanSeeEach).toBe(false);
  });

  it("デッドライン付きのイベントを作成できる", () => {
    const deadline = "2024-03-10T23:59:59.000Z";
    const event = EventFactory.withDeadline(deadline);

    expect(event.deadline).toBe(deadline);
  });

  it("制限付きのイベントを作成できる", () => {
    const event = EventFactory.withRestrictions("domain", [
      "example.com",
      "test.com",
    ]);

    expect(event.participantRestrictionType).toBe("domain");
    expect(event.allowedDomains).toHaveLength(2);
  });
});

describe("UserFactory", () => {
  it("デフォルトのユーザーを作成できる", () => {
    const user = UserFactory.create();

    expect(user.id).toBe("user123");
    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("テストユーザー");
    expect(user.preferredLanguage).toBe("ja");
  });

  it("匿名ユーザーを作成できる", () => {
    const user = UserFactory.anonymous();

    expect(user).toBeNull();
  });

  it("Auth0形式のユーザーを作成できる", () => {
    const user = UserFactory.auth0User();

    expect(user.sub).toBe("auth0|123456");
    expect(user.email).toBe("test@example.com");
    expect(user.email_verified).toBe(true);
  });
});

describe("ScheduleFactory", () => {
  it("デフォルトのスケジュールを作成できる", () => {
    const schedule = ScheduleFactory.create();

    expect(schedule.id).toBe("schedule123");
    expect(schedule.eventId).toBe("event123");
    expect(schedule.userId).toBe("user123");
    expect(schedule.displayName).toBe("テストユーザー");
    expect(schedule.availabilities).toHaveLength(0);
  });

  it("時間枠付きのスケジュールを作成できる", () => {
    const availabilities = [
      AvailabilityFactory.halfHourSlot("2024-03-01T00:00:00.000Z", 10, 0),
      AvailabilityFactory.halfHourSlot("2024-03-01T00:00:00.000Z", 10, 30),
    ];

    const schedule = ScheduleFactory.withAvailabilities(availabilities);

    expect(schedule.availabilities).toHaveLength(2);
  });

  it("匿名スケジュールを作成できる", () => {
    const schedule = ScheduleFactory.anonymous();

    expect(schedule.userId).toBeNull();
    expect(schedule.displayName).toBe("匿名参加者");
  });
});

describe("AvailabilityFactory", () => {
  it("基本的な時間枠を作成できる", () => {
    const availability = AvailabilityFactory.create(
      "2024-03-01T00:00:00.000Z",
      600,
      630,
    );

    expect(availability.date).toBe("2024-03-01T00:00:00.000Z");
    expect(availability.startTime).toBe(600);
    expect(availability.endTime).toBe(630);
  });

  it("30分スロットを作成できる", () => {
    const availability = AvailabilityFactory.halfHourSlot(
      "2024-03-01T00:00:00.000Z",
      14,
      30,
    );

    expect(availability.startTime).toBe(14 * 60 + 30); // 870
    expect(availability.endTime).toBe(14 * 60 + 30 + 30); // 900
  });

  it("1時間スロットを作成できる", () => {
    const availability = AvailabilityFactory.hourSlot(
      "2024-03-01T00:00:00.000Z",
      9,
    );

    expect(availability.startTime).toBe(9 * 60); // 540
    expect(availability.endTime).toBe(10 * 60); // 600
  });
});
