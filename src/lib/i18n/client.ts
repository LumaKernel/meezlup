import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 翻訳リソース
const resources = {
  ja: {
    translation: {
      common: {
        submit: "送信",
        cancel: "キャンセル",
        save: "保存",
        delete: "削除",
        edit: "編集",
        close: "閉じる",
        confirm: "確認",
        loading: "読み込み中...",
        error: "エラー",
        success: "成功",
      },
      auth: {
        login: "ログイン",
        logout: "ログアウト",
        signup: "サインアップ",
        email: "メールアドレス",
        password: "パスワード",
      },
      event: {
        title: "イベント名",
        description: "説明",
        dateRange: "日程範囲",
        deadline: "締切",
        create: "イベントを作成",
        edit: "イベントを編集",
        participants: "参加者",
      },
      schedule: {
        available: "参加可能",
        unavailable: "参加不可",
        maybe: "未定",
        submit: "予定を送信",
      },
    },
  },
  en: {
    translation: {
      common: {
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        confirm: "Confirm",
        loading: "Loading...",
        error: "Error",
        success: "Success",
      },
      auth: {
        login: "Login",
        logout: "Logout",
        signup: "Sign Up",
        email: "Email",
        password: "Password",
      },
      event: {
        title: "Event Title",
        description: "Description",
        dateRange: "Date Range",
        deadline: "Deadline",
        create: "Create Event",
        edit: "Edit Event",
        participants: "Participants",
      },
      schedule: {
        available: "Available",
        unavailable: "Unavailable",
        maybe: "Maybe",
        submit: "Submit Schedule",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ja",
    interpolation: {
      escapeValue: false, // ReactはXSS対策をデフォルトで行う
    },
    detection: {
      order: ["localStorage", "navigator"],
    },
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize i18n:", error);
  });

export default i18n;
