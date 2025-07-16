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
    schedule: {
      grid: {
        time: "時間",
        selected: "選択済み",
        notSelected: "未選択",
        weekdays: {
          0: "日",
          1: "月",
          2: "火",
          3: "水",
          4: "木",
          5: "金",
          6: "土",
        },
      },
      input: {
        schedule: "スケジュール",
        participants: "参加者",
        participantCount: "{{count}}人が参加可能",
        currentUserSlots: "現在の選択",
        dragToSelect: "セルをドラッグして複数選択できます",
        save: "保存",
        backToEdit: "編集に戻る",
        selectAvailableTimes: "参加可能時間を選択",
        overallAvailability: "全体の参加可能状況",
        hoverOrClickCells: "セルをホバーまたはクリックして参加者を確認できます",
      },
      participate: {
        yourInformation: "参加者情報",
        name: "名前",
        namePlaceholder: "名前を入力",
        email: "メールアドレス",
        emailPlaceholder: "メールアドレスを入力",
        error: "エラー",
        selectTimeSlot: "少なくとも1つの時間帯を選択してください",
        enterNameAndEmail: "名前とメールアドレスを入力してください",
        unexpectedError: "予期しないエラーが発生しました",
        success: "成功",
        submitted: "参加可能時間を送信しました",
        minSlots: "15分単位",
        halfHourSlots: "30分単位",
        hourSlots: "1時間単位",
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
    schedule: {
      grid: {
        time: "Time",
        selected: "Selected",
        notSelected: "Not selected",
        weekdays: {
          0: "Sun",
          1: "Mon",
          2: "Tue",
          3: "Wed",
          4: "Thu",
          5: "Fri",
          6: "Sat",
        },
      },
      input: {
        schedule: "Schedule",
        participants: "Participants",
        participantCount: "{{count}} can attend",
        currentUserSlots: "Current Selection",
        dragToSelect: "Drag cells to select multiple",
        save: "Save",
        backToEdit: "Back to Edit",
        selectAvailableTimes: "Select Available Times",
        overallAvailability: "Overall Availability",
        hoverOrClickCells: "Hover or click cells to see participants",
      },
      participate: {
        yourInformation: "Your Information",
        name: "Name",
        namePlaceholder: "Enter your name",
        email: "Email",
        emailPlaceholder: "Enter your email",
        error: "Error",
        selectTimeSlot: "Please select at least one time slot",
        enterNameAndEmail: "Please enter your name and email",
        unexpectedError: "An unexpected error occurred",
        success: "Success",
        submitted: "Your availability has been submitted",
        minSlots: "15 min slots",
        halfHourSlots: "30 min slots",
        hourSlots: "1 hour slots",
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
    ns: ["common", "auth", "schedule"],
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
