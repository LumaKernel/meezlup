import { Title } from "@mantine/core";
import { type Temporal } from "temporal-polyfill";
import { DateDisplay } from "@/components/ui/DateDisplay";

interface EventResultDateSectionProps {
  /** Temporal.ZonedDateTimeインスタンス */
  readonly zonedDateTime: Temporal.ZonedDateTime;
  /** ロケール */
  readonly locale: string;
  /** 子要素 */
  readonly children: React.ReactNode;
}

/**
 * EventResultで使用する日付セクションコンポーネント
 * Temporal.ZonedDateTimeを直接受け取り、DateDisplayに渡す
 */
export function EventResultDateSection({
  children,
  locale,
  zonedDateTime,
}: EventResultDateSectionProps) {
  return (
    <div key={zonedDateTime.toString()}>
      <Title order={4} mb="md">
        <DateDisplay
          zonedDateTime={zonedDateTime}
          locale={locale}
          showIcon
          dateOnly
        />
      </Title>
      {children}
    </div>
  );
}
