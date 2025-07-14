import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { Temporal } from "temporal-polyfill";
import { DateDisplay } from "./DateDisplay";

describe("DateDisplay", () => {
  const testZonedDateTime = Temporal.Instant.from(
    "2025-01-20T00:00:00.000Z",
  ).toZonedDateTimeISO("UTC");

  it("日本語で日付を表示する", () => {
    render(<DateDisplay zonedDateTime={testZonedDateTime} locale="ja" />);

    // 日本語の日付表示を確認（実際の表示は環境によって異なる可能性がある）
    expect(screen.getByText(/2025年1月20日/)).toBeInTheDocument();
  });

  it("英語で日付を表示する", () => {
    render(<DateDisplay zonedDateTime={testZonedDateTime} locale="en" />);

    // 英語の日付表示を確認
    expect(screen.getByText(/January 20, 2025/)).toBeInTheDocument();
  });

  it("アイコン付きで表示する", () => {
    render(
      <DateDisplay zonedDateTime={testZonedDateTime} locale="ja" showIcon />,
    );

    // SVGアイコンが存在することを確認
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains("tabler-icon-calendar")).toBe(true);

    // 日付テキストも表示されることを確認
    expect(screen.getByText(/2025年1月20日/)).toBeInTheDocument();
  });

  it("カスタムフォーマットで表示する", () => {
    render(
      <DateDisplay
        zonedDateTime={testZonedDateTime}
        locale="ja"
        formatOptions={{
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }}
      />,
    );

    // 数値形式の日付表示を確認
    expect(screen.getByText(/2025\/1\/20/)).toBeInTheDocument();
  });

  it("時刻も含めて表示する", () => {
    const dateTimeWithTime = Temporal.Instant.from(
      "2025-01-20T15:30:45.000Z",
    ).toZonedDateTimeISO("UTC");

    render(
      <DateDisplay
        zonedDateTime={dateTimeWithTime}
        locale="ja"
        dateOnly={false}
        formatOptions={{
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short",
        }}
      />,
    );

    // 時刻も含めて表示されることを確認
    expect(screen.getByText(/2025\/1\/20/)).toBeInTheDocument();
    expect(screen.getByText(/15:30/)).toBeInTheDocument();
  });

  it("異なるタイムゾーンで正しく表示する", () => {
    const tokyoDateTime = Temporal.Instant.from(
      "2025-01-20T00:00:00.000Z",
    ).toZonedDateTimeISO("Asia/Tokyo");

    render(
      <DateDisplay
        zonedDateTime={tokyoDateTime}
        locale="ja"
        dateOnly={false}
        formatOptions={{
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short",
        }}
      />,
    );

    // 日本時間（UTC+9）で表示されることを確認
    expect(screen.getByText(/2025年1月20日/)).toBeInTheDocument();
    expect(screen.getByText(/9:00/)).toBeInTheDocument();
  });
});
