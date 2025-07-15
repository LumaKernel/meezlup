import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/lib/i18n/client";
import "@mantine/core/styles.css";

const theme = createTheme({
  fontFamily: "system-ui, sans-serif",
});

// windowインターフェースを拡張
declare global {
  interface Window {
    _originalFetch?: typeof fetch;
  }
}

// APIモックセットアップ
const setupApiMocks = () => {
  // グローバルfetchをモック（一度だけ設定）
  if (typeof window !== "undefined" && !window._originalFetch) {
    window._originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      
      // /auth/profile エンドポイントをモック
      if (url.includes("/auth/profile")) {
        // 現在のauth parametersを取得
        const authParams = (globalThis as any).__STORYBOOK_AUTH__;
        
        if (authParams?.isAuthenticated && authParams?.user) {
          return new Response(JSON.stringify({
            sub: authParams.user.id,
            email: authParams.user.email,
            name: authParams.user.name,
            picture: authParams.user.picture,
            nickname: authParams.user.nickname,
            email_verified: authParams.user.emailVerified,
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response("Unauthorized", { status: 401 });
        }
      }
      
      // その他のリクエストは元のfetchに委譲
      return window._originalFetch!(input, init);
    };
  }
};

// APIモックを一度だけ設定
setupApiMocks();

// グローバルデコレーター
const withProviders = (Story: any, context: any) => {
  // auth parametersをグローバルコンテキストに設定（同期的に設定）
  const authParams = context.parameters?.auth;
  (globalThis as any).__STORYBOOK_AUTH__ = authParams || {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  };

  // ロケール設定
  useEffect(() => {
    const locale = context.globals.locale || "ja";
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale).catch(console.error);
    }
  }, [context.globals.locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <MantineProvider theme={theme}>
        <div className="min-h-screen">
          <Story />
        </div>
      </MantineProvider>
    </I18nextProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    auth: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#0f0f0f",
        },
      ],
    },
  },
  decorators: [withProviders],
  globalTypes: {
    locale: {
      name: "Locale",
      description: "Internationalization locale",
      defaultValue: "ja",
      toolbar: {
        icon: "globe",
        items: [
          { value: "ja", title: "日本語" },
          { value: "en", title: "English" },
        ],
        showName: true,
      },
    },
  },
};

export default preview;