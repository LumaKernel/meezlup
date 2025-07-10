import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { DEFAULT_LANGUAGE } from "./persistence";

// next-i18nextの設定と統合するため、JSONファイルからリソースを読み込む
// ただし、クライアントサイドではNext.jsのi18nルーティングと連携する
// 翻訳リソースをインライン定義（簡単な実装）
const resources = {
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
};

// SSRの場合はLanguageDetectorを使わない
if (typeof window !== "undefined") {
  i18n.use(LanguageDetector);
}

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    lng: DEFAULT_LANGUAGE, // デフォルト言語を設定
    ns: ["common", "auth"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // ReactはXSS対策をデフォルトで行う
    },
    detection: {
      order: ["path", "localStorage", "navigator"],
      lookupFromPathIndex: 0,
    },
    supportedLngs: ["ja", "en"],
    resources,
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize i18n:", error);
  });

export default i18n;
