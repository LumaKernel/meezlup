import type { SupportedLanguage } from "./persistence";

// サーバーサイドで使用する翻訳リソース
export const serverTranslations = {
  ja: {
    common: {
      app: {
        title: "Meetzup",
        description: "ミートアップイベント管理プラットフォーム",
      },
      hero: {
        title: "日程調整を",
        titleHighlight: "もっとシンプル",
        titleSuffix: "に",
        subtitle1: "友達や同僚との日程調整を簡単に。",
        subtitle2: "MeetzUpで最適な日時を見つけよう。",
        welcome: "ようこそ、{{name}}さん！",
        createNewEvent: "新しいイベントを作成",
        eventList: "イベント一覧",
        loginPrompt: "ログインして、イベントの作成や管理を始めましょう",
      },
      features: {
        easyCreation: {
          title: "簡単なイベント作成",
          description: "数クリックでイベントを作成し、参加者に共有できます",
        },
        realTimeAdjustment: {
          title: "リアルタイム調整",
          description: "参加者の都合をリアルタイムで確認しながら日程を決定",
        },
        privacyFocused: {
          title: "プライバシー重視",
          description: "匿名での参加も可能。必要な情報だけを共有",
        },
      },
      footer: {
        copyright: "© 2024 MeetzUp. All rights reserved.",
      },
      ui: {
        button: {
          submit: "送信",
          cancel: "キャンセル",
          save: "保存",
          delete: "削除",
          edit: "編集",
          close: "閉じる",
          loading: "読み込み中...",
        },
      },
      navigation: {
        home: "ホーム",
        events: "イベント",
        profile: "プロフィール",
        settings: "設定",
      },
    },
    auth: {
      login: {
        title: "ログイン",
        button: "ログイン",
      },
      logout: {
        button: "ログアウト",
      },
    },
  },
  en: {
    common: {
      app: {
        title: "Meetzup",
        description: "Meetup event management platform",
      },
      hero: {
        title: "Schedule meetings",
        titleHighlight: "more simply",
        titleSuffix: "",
        subtitle1: "Easy scheduling with friends and colleagues.",
        subtitle2: "Find the best time with MeetzUp.",
        welcome: "Welcome, {{name}}!",
        createNewEvent: "Create New Event",
        eventList: "Event List",
        loginPrompt: "Log in to start creating and managing events",
      },
      features: {
        easyCreation: {
          title: "Easy Event Creation",
          description: "Create and share events with just a few clicks",
        },
        realTimeAdjustment: {
          title: "Real-time Coordination",
          description:
            "Decide on schedules while checking participants' availability in real-time",
        },
        privacyFocused: {
          title: "Privacy-Focused",
          description:
            "Anonymous participation available. Share only necessary information",
        },
      },
      footer: {
        copyright: "© 2024 MeetzUp. All rights reserved.",
      },
      ui: {
        button: {
          submit: "Submit",
          cancel: "Cancel",
          save: "Save",
          delete: "Delete",
          edit: "Edit",
          close: "Close",
          loading: "Loading...",
        },
      },
      navigation: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        settings: "Settings",
      },
    },
    auth: {
      login: {
        title: "Login",
        button: "Login",
      },
      logout: {
        button: "Logout",
      },
    },
  },
} as const;

type TranslationValue = string | Record<string, unknown>;

// サーバーサイドで翻訳を取得するヘルパー関数
export function getServerTranslation(
  locale: SupportedLanguage,
  namespace: string,
  key: string,
): string {
  const keys = key.split(".");
  const namespaceData =
    serverTranslations[locale][
      namespace as keyof (typeof serverTranslations)["ja"]
    ];

  let current: TranslationValue | undefined = namespaceData;

  for (const k of keys) {
    if (typeof current === "object" && k in current) {
      current = current[k] as TranslationValue;
    } else {
      current = undefined;
      break;
    }
  }

  return typeof current === "string" ? current : key;
}
