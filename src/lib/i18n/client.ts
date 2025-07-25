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
      aggregate: {
        availableTimes: "参加可能時間",
        participants: "人",
        time: "時間",
        available: "人参加可能",
        more: "他",
        noParticipants: "参加者なし",
        participantsAvailable: "人が参加可能",
      },
      weekdays: {
        sun: "日",
        mon: "月",
        tue: "火",
        wed: "水",
        thu: "木",
        fri: "金",
        sat: "土",
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
    event: {
      detail: {
        title: "イベント詳細",
        description: "説明",
        startDate: "開始日",
        endDate: "終了日",
        changeDeadline: "変更期限",
        shareEvent: "イベントを共有",
        shareDescription: "参加者にこのリンクを共有してください：",
        linkCopied: "リンクをコピーしました！",
        viewParticipationPage: "参加ページを表示",
        linkOnly: "リンクのみ",
        public: "公開",
        private: "非公開",
      },
      result: {
        aggregatedResults: "集計結果",
        participant: "人",
        participants: "人",
        error: "エラー",
        availabilityHeatmap: "参加可能時間のヒートマップ",
        heatmapDescription: "色が濃いほど多くの参加者が参加可能です",
        bestTimeSlots: "最適な時間帯",
        updateAvailability: "参加可能時間を更新",
        backToEventDetails: "イベント詳細に戻る",
        failedToLoadData: "集計データの取得に失敗しました",
      },
      create: {
        title: "新しいイベントを作成",
        eventName: "イベント名",
        eventNamePlaceholder: "イベント名を入力",
        eventNameRequired: "イベント名は必須です",
        eventNameMaxLength: "イベント名は100文字以内で入力してください",
        description: "詳細説明",
        descriptionPlaceholder: "イベントの詳細を入力（任意）",
        descriptionMaxLength: "説明は1000文字以内で入力してください",
        dateRange: "日付範囲",
        selectDateRange: "日付範囲を選択",
        dateRangeInvalid: "終了日は開始日以降にしてください",
        changeDeadline: "変更期限（任意）",
        changeDeadlinePlaceholder: "期限を選択",
        timeSlotDuration: "時間帯の幅",
        selectDuration: "時間幅を選択",
        "15minutes": "15分",
        "30minutes": "30分",
        "1hour": "1時間",
        maxParticipants: "参加人数制限（任意）",
        maxParticipantsPlaceholder: "最大参加人数を入力",
        maxParticipantsMin: "参加人数は1人以上で設定してください",
        permission: "権限設定",
        selectPermission: "権限を選択",
        public: "公開",
        private: "非公開",
        linkOnly: "リンクのみ",
        cancel: "キャンセル",
        createEvent: "イベントを作成",
        error: "エラー",
        success: "成功",
        eventCreated: "イベントを作成しました",
        unexpectedError: "予期しないエラーが発生しました",
      },
      list: {
        myEvents: "マイイベント",
        createEvent: "イベントを作成",
        noEvents: "まだイベントがありません。最初のイベントを作成しましょう！",
        failedToFetch: "イベントの取得に失敗しました",
        error: "エラー",
        linkOnly: "リンクのみ",
        public: "公開",
        private: "非公開",
        start: "開始:",
        end: "終了:",
      },
    },
    ui: {
      notification: {
        success: "成功",
        error: "エラー",
        info: "情報",
        warning: "警告",
      },
      time: {
        dateFormat: "YYYY年MM月DD日",
        timeFormat: "HH:mm",
        dateTimeFormat: "YYYY年MM月DD日 HH:mm",
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
      aggregate: {
        availableTimes: "Available Times",
        participants: "participants",
        time: "Time",
        available: "available",
        more: "more",
        noParticipants: "No participants",
        participantsAvailable: "participants available",
      },
      weekdays: {
        sun: "Sun",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat",
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
    event: {
      detail: {
        title: "Event Details",
        description: "Description",
        startDate: "Start Date",
        endDate: "End Date",
        changeDeadline: "Change Deadline",
        shareEvent: "Share Event",
        shareDescription: "Share this link with participants:",
        linkCopied: "Link copied to clipboard!",
        viewParticipationPage: "View Participation Page",
        linkOnly: "Link Only",
        public: "Public",
        private: "Private",
      },
      result: {
        aggregatedResults: "Aggregated Results",
        participant: "participant",
        participants: "participants",
        error: "Error",
        availabilityHeatmap: "Availability Heatmap",
        heatmapDescription:
          "Darker colors indicate more participants are available",
        bestTimeSlots: "Best Time Slots",
        updateAvailability: "Update Your Availability",
        backToEventDetails: "Back to Event Details",
        failedToLoadData: "Failed to load aggregated data",
      },
      create: {
        title: "Create New Event",
        eventName: "Event Name",
        eventNamePlaceholder: "Enter event name",
        eventNameRequired: "Event name is required",
        eventNameMaxLength: "Event name must be at most 100 characters",
        description: "Description",
        descriptionPlaceholder: "Enter event description (optional)",
        descriptionMaxLength: "Description must be at most 1000 characters",
        dateRange: "Date Range",
        selectDateRange: "Select date range",
        dateRangeInvalid: "End date must be after start date",
        changeDeadline: "Change Deadline (Optional)",
        changeDeadlinePlaceholder: "Select deadline",
        timeSlotDuration: "Time Slot Duration",
        selectDuration: "Select duration",
        "15minutes": "15 minutes",
        "30minutes": "30 minutes",
        "1hour": "1 hour",
        maxParticipants: "Max Participants (Optional)",
        maxParticipantsPlaceholder: "Enter max participants",
        maxParticipantsMin: "Max participants must be at least 1",
        permission: "Permission",
        selectPermission: "Select permission",
        public: "Public",
        private: "Private",
        linkOnly: "Link Only",
        cancel: "Cancel",
        createEvent: "Create Event",
        error: "Error",
        success: "Success",
        eventCreated: "Event created successfully",
        unexpectedError: "An unexpected error occurred",
      },
      list: {
        myEvents: "My Events",
        createEvent: "Create Event",
        noEvents: "No events yet. Create your first event!",
        failedToFetch: "Failed to fetch events",
        error: "Error",
        linkOnly: "Link Only",
        public: "Public",
        private: "Private",
        start: "Start:",
        end: "End:",
      },
    },
    ui: {
      notification: {
        success: "Success",
        error: "Error",
        info: "Information",
        warning: "Warning",
      },
      time: {
        dateFormat: "MM/DD/YYYY",
        timeFormat: "h:mm A",
        dateTimeFormat: "MM/DD/YYYY h:mm A",
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
    ns: ["common", "auth", "schedule", "event", "ui"],
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
