import { Schema } from "effect";
import { Temporal } from "temporal-polyfill";

// 時間帯幅の選択肢
export const TimeSlotDuration = Schema.Literal(15, 30, 60);
export type TimeSlotDuration = Schema.Schema.Type<typeof TimeSlotDuration>;

// 権限設定
export const EventPermission = Schema.Literal("public", "private", "link-only");
export type EventPermission = Schema.Schema.Type<typeof EventPermission>;

// メッセージ生成関数（将来的にlocaleを受け取れるように）
const getMessages = (_locale?: string) => ({
  nameRequired: "イベント名は必須です",
  nameMaxLength: "イベント名は100文字以内で入力してください",
  descriptionMaxLength: "説明は1000文字以内で入力してください",
  dateRangeInvalid: "終了日は開始日以降にしてください",
  maxParticipantsPositive: "参加人数は1人以上で設定してください",
});

// 国際化対応版のイベント作成フォームスキーマ
export const createEventFormSchema = (locale?: string) => {
  const messages = getMessages(locale);

  return Schema.Struct({
    // イベント名（必須、1-100文字）
    name: Schema.String.pipe(
      Schema.minLength(1, { message: () => messages.nameRequired }),
      Schema.maxLength(100, {
        message: () => messages.nameMaxLength,
      }),
    ),

    // 詳細説明（任意、最大1000文字）
    description: Schema.optionalWith(
      Schema.String.pipe(
        Schema.maxLength(1000, {
          message: () => messages.descriptionMaxLength,
        }),
      ),
      { default: () => "" },
    ),

    // 日付範囲（開始日と終了日）
    dateRange: Schema.Struct({
      start: Schema.instanceOf(Temporal.PlainDate),
      end: Schema.instanceOf(Temporal.PlainDate),
    }).pipe(
      Schema.filter(
        (value: { start: Temporal.PlainDate; end: Temporal.PlainDate }) =>
          Temporal.PlainDate.compare(value.start, value.end) <= 0,
        {
          message: () => messages.dateRangeInvalid,
        },
      ),
    ),

    // 時間帯幅（15分、30分、1時間）
    timeSlotDuration: TimeSlotDuration,

    // 変更期限（任意）
    changeDeadline: Schema.optional(Schema.instanceOf(Temporal.PlainDate)),

    // 参加制限人数（任意、1以上）
    maxParticipants: Schema.optional(
      Schema.Number.pipe(
        Schema.int(),
        Schema.positive({ message: () => messages.maxParticipantsPositive }),
      ),
    ),

    // 権限設定
    permission: EventPermission,
  });
};

export type CreateEventForm = Schema.Schema.Type<
  ReturnType<typeof createEventFormSchema>
>;

// サーバーに送信する際のスキーマ（日付をISO文字列に変換）
export const createEventRequestSchema = (locale?: string) => {
  const CreateEventForm = createEventFormSchema(locale);

  return Schema.transform(
    CreateEventForm,
    Schema.Struct({
      name: Schema.String,
      description: Schema.String,
      dateRange: Schema.Struct({
        start: Schema.String,
        end: Schema.String,
      }),
      timeSlotDuration: TimeSlotDuration,
      changeDeadline: Schema.optional(Schema.String),
      maxParticipants: Schema.optional(Schema.Number),
      permission: EventPermission,
    }),
    {
      strict: true,
      decode: (form) => ({
        ...form,
        dateRange: {
          start: form.dateRange.start.toString(),
          end: form.dateRange.end.toString(),
        },
        changeDeadline: form.changeDeadline?.toString(),
      }),
      encode: (req) => ({
        ...req,
        dateRange: {
          start: Temporal.PlainDate.from(req.dateRange.start),
          end: Temporal.PlainDate.from(req.dateRange.end),
        },
        changeDeadline: req.changeDeadline
          ? Temporal.PlainDate.from(req.changeDeadline)
          : undefined,
      }),
    },
  );
};

export type CreateEventRequest = Schema.Schema.Type<
  ReturnType<typeof createEventRequestSchema>
>;
