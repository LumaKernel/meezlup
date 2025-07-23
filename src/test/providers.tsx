import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { I18nextProvider , initReactI18next } from "react-i18next";
import i18n from "i18next";

// テスト用のi18n設定
const testI18n = i18n.createInstance();
void testI18n.use(initReactI18next).init({
  lng: "ja",
  fallbackLng: "ja",
  ns: ["common", "schedule", "event", "auth", "profile", "errors", "ui"],
  defaultNS: "common",
  resources: {
    ja: {
      common: {
        ui: {
          button: {
            loading: "読み込み中...",
          },
        },
      },
      schedule: {
        participate: {
          selectTimeSlot: "時間枠を選択してください",
          enterNameAndEmail: "名前とメールアドレスを入力してください",
          success: "成功",
          submitted: "送信されました",
          error: "エラー",
          yourInformation: "あなたの情報",
          name: "名前",
          namePlaceholder: "山田太郎",
          email: "メールアドレス",
          emailPlaceholder: "example@example.com",
        },
        input: {
          saving: "保存中...",
          saved: "保存済み",
          selectAvailableTimes: "参加可能な時間を選択",
          dragToSelect: "ドラッグして選択",
          overallAvailability: "全体の空き状況",
          hoverOrClickCells: "セルをホバーまたはクリックして参加者を表示",
          participantCount: "{{count}}人が参加可能",
          backToEdit: "編集に戻る",
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
            creatorCanSeeEmailsDescription: "作成者に参加者のメールアドレスを表示する",
          },
          "15minutes": "15分",
          "30minutes": "30分",
          "1hour": "1時間",
          submit: "イベントを作成",
          success: "イベントを作成しました",
          error: "エラーが発生しました",
        },
        result: {
          failedToFetch: "データの取得に失敗しました",
          error: "エラー",
          aggregatedResults: "集計結果",
          participant: "参加者",
          participants: "参加者",
          availabilityHeatmap: "空き状況ヒートマップ",
          heatmapDescription: "色が濃いほど多くの参加者が参加可能です",
          bestTimeSlots: "最適な時間帯",
          updateAvailability: "空き状況を更新",
          backToEventDetails: "イベント詳細に戻る",
        },
      },
      auth: {
        login: {
          button: "ログイン",
        },
        logout: {
          button: "ログアウト",
        },
      },
      profile: {},
      errors: {},
      ui: {
        date: {
          today: "今日",
          tomorrow: "明日",
          yesterday: "昨日",
        },
      },
    },
    en: {
      common: {
        ui: {
          button: {
            loading: "Loading...",
          },
        },
      },
      schedule: {
        participate: {
          selectTimeSlot: "Please select a time slot",
          enterNameAndEmail: "Please enter your name and email",
          success: "Success",
          submitted: "Submitted",
          error: "Error",
          yourInformation: "Your Information",
          name: "Name",
          namePlaceholder: "John Doe",
          email: "Email",
          emailPlaceholder: "example@example.com",
        },
        input: {
          saving: "Saving...",
          saved: "Saved",
          selectAvailableTimes: "Select Available Times",
          dragToSelect: "Drag to select",
          overallAvailability: "Overall Availability",
          hoverOrClickCells: "Hover or click cells to see participants",
          participantCount: "{{count}} participants available",
          backToEdit: "Back to Edit",
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
            creatorCanSeeEmailsDescription: "Show participant email addresses to the creator",
          },
          "15minutes": "15 minutes",
          "30minutes": "30 minutes",
          "1hour": "1 hour",
          submit: "Create Event",
          success: "Event created successfully",
          error: "An error occurred",
        },
        result: {
          failedToFetch: "Failed to fetch data",
          error: "Error",
          aggregatedResults: "Aggregated Results",
          participant: "participant",
          participants: "participants",
          availabilityHeatmap: "Availability Heatmap",
          heatmapDescription: "Darker colors indicate more participants are available",
          bestTimeSlots: "Best Time Slots",
          updateAvailability: "Update Availability",
          backToEventDetails: "Back to Event Details",
        },
      },
      auth: {
        login: {
          button: "Login",
        },
        logout: {
          button: "Logout",
        },
      },
      profile: {},
      errors: {},
      ui: {
        date: {
          today: "Today",
          tomorrow: "Tomorrow",
          yesterday: "Yesterday",
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

// テスト用のQueryClient作成関数
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// テスト用のルーターコンテキスト
export const TestRouterContext = {
  push: () => Promise.resolve(true),
  replace: () => Promise.resolve(true),
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => Promise.resolve(),
};

// すべてのプロバイダーを含むラッパー
export function AllTheProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={testI18n}>
        <MantineProvider>
          {children}
        </MantineProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}