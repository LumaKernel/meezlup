import { Text, Group } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { Temporal } from "temporal-polyfill";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
// vrhemelの比較関数は今のところ使用しない

interface DateDisplayProps {
  /** Temporal.ZonedDateTimeインスタンス */
  readonly zonedDateTime: Temporal.ZonedDateTime;
  /** ロケール */
  readonly locale: string;
  /** アイコンを表示するかどうか */
  readonly showIcon?: boolean;
  /** 日付フォーマットオプション */
  readonly formatOptions?: Intl.DateTimeFormatOptions;
  /** 日付のみ表示するか（false の場合は時刻も表示） */
  readonly dateOnly?: boolean;
  /** 相対的な日付表示を含めるか（例：「今日」「明日」） */
  readonly showRelative?: boolean;
}

/**
 * Temporal.ZonedDateTimeを受け取り、ローカライズされた日時を表示するコンポーネント
 */
export function DateDisplay({
  dateOnly = true,
  formatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale,
  showIcon = false,
  showRelative = false,
  zonedDateTime,
}: DateDisplayProps) {
  const { t } = useTranslation("ui");
  // フォーマッターをメモ化してパフォーマンスを最適化
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, formatOptions),
    [locale, formatOptions],
  );

  // 相対的な日付表示
  const relativeText = useMemo(() => {
    if (!showRelative || !dateOnly) return null;

    const today = Temporal.Now.plainDateISO();
    const targetDate = zonedDateTime.toPlainDate();

    if (targetDate.equals(today)) {
      return t("date.today");
    }

    const tomorrow = today.add({ days: 1 });
    if (targetDate.equals(tomorrow)) {
      return t("date.tomorrow");
    }

    const yesterday = today.subtract({ days: 1 });
    if (targetDate.equals(yesterday)) {
      return t("date.yesterday");
    }

    return null;
  }, [showRelative, dateOnly, zonedDateTime, locale]);

  // Intl.DateTimeFormatにはDateオブジェクトを渡す必要がある
  const jsDate = new Date(zonedDateTime.epochMilliseconds);
  const formattedDate = formatter.format(jsDate);

  const displayText = relativeText ? (
    <>
      <Text component="span" fw={600}>
        {relativeText}
      </Text>
      <Text component="span" c="dimmed" size="sm">
        {" "}
        ({formattedDate})
      </Text>
    </>
  ) : (
    formattedDate
  );

  if (showIcon) {
    return (
      <Group gap="xs">
        <IconCalendar size={20} />
        <Text>{displayText}</Text>
      </Group>
    );
  }

  return <Text>{displayText}</Text>;
}
