/**
 * 言語設定の永続化ユーティリティ
 */

export const LANGUAGE_STORAGE_KEY = "preferred-language";
export const DEFAULT_LANGUAGE = "ja";
export const SUPPORTED_LANGUAGES = ["ja", "en"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * ローカルストレージから言語設定を取得
 */
export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch (error) {
    console.warn("Failed to read language from localStorage:", error);
  }

  return DEFAULT_LANGUAGE;
}

/**
 * ローカルストレージに言語設定を保存
 */
export function storeLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn("Failed to store language in localStorage:", error);
  }
}

/**
 * ブラウザの言語設定から推測
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * URLパスから言語を検出
 */
export function detectLanguageFromPath(pathname: string): SupportedLanguage {
  const pathLang = pathname.split("/")[1];
  if (SUPPORTED_LANGUAGES.includes(pathLang as SupportedLanguage)) {
    return pathLang as SupportedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * 最適な言語を選択（優先順位: URL > localStorage > browser > default）
 */
export function selectBestLanguage(pathname?: string): SupportedLanguage {
  // URLから言語を検出
  if (pathname) {
    const pathLang = detectLanguageFromPath(pathname);
    if (pathLang !== DEFAULT_LANGUAGE) {
      return pathLang;
    }
  }

  // ローカルストレージから取得
  const storedLang = getStoredLanguage();
  if (storedLang !== DEFAULT_LANGUAGE) {
    return storedLang;
  }

  // ブラウザ言語設定から推測
  return detectBrowserLanguage();
}
