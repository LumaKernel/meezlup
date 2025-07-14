import { Temporal } from "temporal-polyfill";
import { startOfWeek, endOfWeek, compareAsc } from "vremel";

/**
 * プリセットのフォーマットオプション
 */
export const formatPresets = {
  /** 日付のみ（曜日あり） */
  dateWithWeekday: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  } satisfies Intl.DateTimeFormatOptions,

  /** 日付のみ（短い形式） */
  dateShort: {
    year: "numeric",
    month: "short",
    day: "numeric",
  } satisfies Intl.DateTimeFormatOptions,

  /** 日付のみ（数値形式） */
  dateNumeric: {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  } satisfies Intl.DateTimeFormatOptions,

  /** 時刻のみ */
  timeOnly: {
    hour: "numeric",
    minute: "numeric",
  } satisfies Intl.DateTimeFormatOptions,

  /** 日時（フル） */
  dateTimeFull: {
    dateStyle: "full",
    timeStyle: "short",
  } satisfies Intl.DateTimeFormatOptions,

  /** 日時（短い形式） */
  dateTimeShort: {
    dateStyle: "short",
    timeStyle: "short",
  } satisfies Intl.DateTimeFormatOptions,
} as const;

/**
 * 日付の範囲を人間が読みやすい形式にフォーマット
 */
export function formatDateRange(
  start: Temporal.PlainDate | Temporal.ZonedDateTime,
  end: Temporal.PlainDate | Temporal.ZonedDateTime,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const formatter = new Intl.DateTimeFormat(locale, options);

  // PlainDateに変換
  const startDate = "toPlainDate" in start ? start.toPlainDate() : start;
  const endDate = "toPlainDate" in end ? end.toPlainDate() : end;

  // 同じ年の場合
  if (startDate.year === endDate.year) {
    // 同じ月の場合
    if (startDate.month === endDate.month) {
      // 同じ日の場合
      if (startDate.day === endDate.day) {
        // PlainDateをDateオブジェクトに変換
        const startJsDate = new Date(startDate.toString());
        return formatter.format(startJsDate);
      }
      // 月内の範囲
      const startFormat = new Intl.DateTimeFormat(locale, {
        month: options?.month || "long",
        day: "numeric",
      });
      const endFormat = new Intl.DateTimeFormat(locale, {
        day: "numeric",
      });
      const startJsDate = new Date(startDate.toString());
      const endJsDate = new Date(endDate.toString());
      return `${startFormat.format(startJsDate) satisfies string}〜${endFormat.format(endJsDate) satisfies string}`;
    }
  }

  // 異なる年/月の場合
  const startJsDate = new Date(startDate.toString());
  const endJsDate = new Date(endDate.toString());
  return `${formatter.format(startJsDate) satisfies string}〜${formatter.format(endJsDate) satisfies string}`;
}

/**
 * 相対的な時間表示（例：「3日後」「2時間前」）
 */
export function formatRelativeTime(
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
  locale: string,
  baseDate?: Temporal.PlainDate | Temporal.ZonedDateTime,
): string {
  const base = baseDate || Temporal.Now.plainDateISO();
  const target = "toPlainDate" in date ? date.toPlainDate() : date;
  const baseAsDate = "toPlainDate" in base ? base.toPlainDate() : base;

  // 日数の差を計算
  const days = target.until(baseAsDate, { largestUnit: "days" }).days;

  if (days === 0) return locale === "ja" ? "今日" : "Today";
  if (days === 1) return locale === "ja" ? "明日" : "Tomorrow";
  if (days === -1) return locale === "ja" ? "昨日" : "Yesterday";

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(days) < 7) {
    return rtf.format(days, "day");
  }

  const weeks = Math.floor(days / 7);
  if (Math.abs(weeks) < 4) {
    return rtf.format(weeks, "week");
  }

  const months = Math.floor(days / 30);
  if (Math.abs(months) < 12) {
    return rtf.format(months, "month");
  }

  const years = Math.floor(days / 365);
  return rtf.format(years, "year");
}

/**
 * 時間の長さを人間が読みやすい形式にフォーマット
 */
export function formatDuration(
  duration: Temporal.Duration,
  locale: string,
): string {
  const parts: Array<string> = [];

  if (duration.hours > 0) {
    parts.push(
      locale === "ja"
        ? `${duration.hours satisfies number}時間`
        : `${duration.hours satisfies number} hour${(duration.hours === 1 ? "" : "s") satisfies string}`,
    );
  }

  if (duration.minutes > 0) {
    parts.push(
      locale === "ja"
        ? `${duration.minutes satisfies number}分`
        : `${duration.minutes satisfies number} minute${(duration.minutes === 1 ? "" : "s") satisfies string}`,
    );
  }

  return parts.join(locale === "ja" ? "" : " ");
}

/**
 * 週の一覧を取得（vrmel使用）
 */
export function getWeekDates(
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
  options?: { firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
): Array<Temporal.PlainDate> {
  const plainDate = "toPlainDate" in date ? date.toPlainDate() : date;
  const weekOptions = { firstDayOfWeek: options?.firstDayOfWeek ?? 0 };
  const weekStart = startOfWeek(plainDate, weekOptions);
  const weekEnd = endOfWeek(plainDate, weekOptions);

  const dates: Array<Temporal.PlainDate> = [];
  let current = weekStart;

  while (compareAsc(current, weekEnd) <= 0) {
    dates.push(current);
    current = current.add({ days: 1 });
  }

  return dates;
}
