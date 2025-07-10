import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./persistence";

// エラーメッセージ用のi18nインスタンスを作成
export const createErrorI18n = async (locale: string = DEFAULT_LANGUAGE) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(
            `../../../public/locales/${language satisfies string}/${namespace satisfies string}.json`
          ),
      ),
    )
    .init({
      lng: locale,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      ns: ["errors"],
      defaultNS: "errors",
    });

  return i18nInstance;
};

// エラーメッセージを取得するヘルパー関数
export const getErrorMessage = async (
  key: string,
  locale: string = DEFAULT_LANGUAGE,
  options?: Record<string, unknown>,
) => {
  const i18n = await createErrorI18n(locale);
  return i18n.t(key, options);
};
