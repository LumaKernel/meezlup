import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/lib/i18n/client";
import "@mantine/core/styles.css";

const theme = createTheme({
  fontFamily: "system-ui, sans-serif",
});

// グローバルデコレーター
const withProviders = (Story: any, context: any) => {
  // auth parametersをグローバルコンテキストに設定
  useEffect(() => {
    const authParams = context.parameters?.auth;
    (globalThis as any).__STORYBOOK_AUTH__ = authParams || {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    };
  }, [context.parameters?.auth]);

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