import { render as rtlRender } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
import type { ReactElement } from "react";
import { consumePromise } from "@/lib/utils/promise";

// i18n初期化
consumePromise(
  i18n.use(initReactI18next).init({
    lng: "ja",
    fallbackLng: "ja",
    ns: ["common", "schedule", "event", "auth", "profile", "errors", "ui"],
    defaultNS: "common",
    resources: {
      ja: {
        common: {},
        schedule: {
          participate: {
            selectTimeSlot: "時間枠を選択してください",
            enterNameAndEmail: "名前とメールアドレスを入力してください",
            success: "成功",
            submitted: "送信されました",
            error: "エラー",
          },
          input: {
            saving: "保存中...",
            saved: "保存済み",
          },
        },
        event: {
          create: {
            title: "新規イベント作成",
            field: {
              name: "イベント名",
              namePlaceholder: "例: 新年会",
              description: "イベント説明",
              descriptionPlaceholder: "例: 2025年の新年会を開催します",
              dateRange: "日程候補",
              dateRangeDescription: "参加者が選択できる日程の範囲",
              timeSlotDuration: "時間枠の単位",
              creatorCanSeeEmails: "メールアドレス表示",
              creatorCanSeeEmailsDescription:
                "作成者に参加者のメールアドレスを表示する",
            },
            "15minutes": "15分",
            "30minutes": "30分",
            "1hour": "1時間",
            submit: "イベントを作成",
            success: "イベントを作成しました",
            error: "エラーが発生しました",
          },
        },
        auth: {},
        profile: {},
        errors: {},
        ui: {},
      },
      en: {
        common: {},
        schedule: {
          participate: {
            selectTimeSlot: "Please select a time slot",
            enterNameAndEmail: "Please enter your name and email",
            success: "Success",
            submitted: "Submitted",
            error: "Error",
          },
          input: {
            saving: "Saving...",
            saved: "Saved",
          },
        },
        event: {
          create: {
            title: "Create New Event",
            field: {
              name: "Event Name",
              namePlaceholder: "e.g., New Year Party",
              description: "Event Description",
              descriptionPlaceholder: "e.g., Let's celebrate the new year 2025",
              dateRange: "Date Candidates",
              dateRangeDescription: "Range of dates participants can select",
              timeSlotDuration: "Time Slot Duration",
              creatorCanSeeEmails: "Show Email Addresses",
              creatorCanSeeEmailsDescription:
                "Show participant email addresses to the creator",
            },
            "15minutes": "15 minutes",
            "30minutes": "30 minutes",
            "1hour": "1 hour",
            submit: "Create Event",
            success: "Event created successfully",
            error: "An error occurred",
          },
        },
        auth: {},
        profile: {},
        errors: {},
        ui: {},
      },
    },
  }),
);

// QueryClient作成
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// カスタムrender関数
export function render(ui: ReactElement, options = {}) {
  const queryClient = createTestQueryClient();

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <MantineProvider>{children}</MantineProvider>
        </I18nextProvider>
      </QueryClientProvider>
    ),
    ...options,
  });
}

// re-export everything
export * from "@testing-library/react";
