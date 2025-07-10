import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect, fn } from "@storybook/test";
import { vi } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { I18nProvider } from "@/components/I18nProvider";
import * as navigation from "next/navigation";
import Cookies from "js-cookie";
import type { MockAppRouterInstance, MockParams } from "@/test/mocks/types";

// React のインポート
import React from "react";

// モック関数
const mockPush = fn();
const mockRefresh = fn();
const mockCookieSet = fn();

const meta = {
  title: "Components/UI/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story, context) => {
      // ナビゲーションのモック
      const mockRouter: MockAppRouterInstance = {
        push: mockPush,
        refresh: mockRefresh,
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
      };
      vi.spyOn(navigation, "useRouter").mockReturnValue(mockRouter);

      // パラメータのモック（グローバルロケールに基づく）
      const locale = (context.globals.locale as string) || "ja";
      const mockParams: MockParams = {
        locale,
      };
      vi.spyOn(navigation, "useParams").mockReturnValue(mockParams);

      // Cookieのモック
      vi.spyOn(Cookies, "set").mockImplementation(
        mockCookieSet as typeof Cookies.set,
      );

      return (
        <I18nProvider locale={context.globals.locale as "ja" | "en"}>
          <div style={{ padding: "20px" }}>
            <Story />
          </div>
        </I18nProvider>
      );
    },
  ],
  beforeEach: () => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockCookieSet.mockClear();
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// 日本語選択状態
export const JapaneseSelected: Story = {
  parameters: {
    globals: {
      locale: "ja",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("日本語ボタンがアクティブ", async () => {
      const jaButton = canvas.getByRole("button", { name: "日本語" });
      const enButton = canvas.getByRole("button", { name: "English" });

      await expect(jaButton).toHaveAttribute("data-active", "true");
      await expect(enButton).toHaveAttribute("data-active", "false");
    });

    await step("英語ボタンをクリックすると言語が切り替わる", async () => {
      // window.locationのモック
      Object.defineProperty(window, "location", {
        value: { pathname: "/ja/events" },
        writable: true,
        configurable: true,
      });

      const enButton = canvas.getByRole("button", { name: "English" });
      await userEvent.click(enButton);

      await expect(mockCookieSet).toHaveBeenCalledWith("i18nextLng", "en", {
        expires: 365,
      });
      await expect(mockPush).toHaveBeenCalledWith("/en/events");
      await expect(mockRefresh).toHaveBeenCalled();
    });
  },
};

// 英語選択状態
export const EnglishSelected: Story = {
  parameters: {
    globals: {
      locale: "en",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("英語ボタンがアクティブ", async () => {
      const jaButton = canvas.getByRole("button", { name: "日本語" });
      const enButton = canvas.getByRole("button", { name: "English" });

      await expect(jaButton).toHaveAttribute("data-active", "false");
      await expect(enButton).toHaveAttribute("data-active", "true");
    });

    await step("日本語ボタンをクリックすると言語が切り替わる", async () => {
      // window.locationのモック
      Object.defineProperty(window, "location", {
        value: { pathname: "/en/profile" },
        writable: true,
        configurable: true,
      });

      const jaButton = canvas.getByRole("button", { name: "日本語" });
      await userEvent.click(jaButton);

      await expect(mockCookieSet).toHaveBeenCalledWith("i18nextLng", "ja", {
        expires: 365,
      });
      await expect(mockPush).toHaveBeenCalledWith("/ja/profile");
      await expect(mockRefresh).toHaveBeenCalled();
    });
  },
};

// ホバー状態
export const HoverState: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ボタンにホバーできる", async () => {
      const jaButton = canvas.getByRole("button", { name: "日本語" });
      const enButton = canvas.getByRole("button", { name: "English" });

      // 日本語ボタンにホバー
      await userEvent.hover(jaButton);

      // 英語ボタンにホバー
      await userEvent.hover(enButton);

      // ホバーを解除
      await userEvent.unhover(enButton);
    });
  },
};

// アクティブボタンのクリック
export const ClickActiveButton: Story = {
  parameters: {
    globals: {
      locale: "ja",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "既にアクティブなボタンをクリックしても何も起こらない",
      async () => {
        const jaButton = canvas.getByRole("button", { name: "日本語" });

        await userEvent.click(jaButton);

        // 何も呼ばれない
        await expect(mockPush).not.toHaveBeenCalled();
        await expect(mockRefresh).not.toHaveBeenCalled();
        await expect(mockCookieSet).not.toHaveBeenCalled();
      },
    );
  },
};

// 異なるパスでの動作
export const DifferentPaths: Story = {
  parameters: {
    globals: {
      locale: "ja",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ルートパスで言語切り替え", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/ja" },
        writable: true,
        configurable: true,
      });

      const enButton = canvas.getByRole("button", { name: "English" });
      await userEvent.click(enButton);

      await expect(mockPush).toHaveBeenCalledWith("/en");
    });

    mockPush.mockClear();

    await step("ネストしたパスで言語切り替え", async () => {
      Object.defineProperty(window, "location", {
        value: { pathname: "/ja/events/123/participate" },
        writable: true,
        configurable: true,
      });

      const enButton = canvas.getByRole("button", { name: "English" });
      await userEvent.click(enButton);

      await expect(mockPush).toHaveBeenCalledWith("/en/events/123/participate");
    });
  },
};

// インタラクティブなストーリー
export const Interactive: Story = {
  render: () => {
    // 状態を管理するためのコンポーネント
    const InteractiveWrapper = () => {
      const [currentLocale, setCurrentLocale] = React.useState("ja");

      // パラメータのモックを更新
      React.useEffect(() => {
        const mockParams: MockParams = {
          locale: currentLocale,
        };
        vi.spyOn(navigation, "useParams").mockReturnValue(mockParams);
      }, [currentLocale]);

      // pushのモックを更新
      React.useEffect(() => {
        mockPush.mockImplementation((path: string) => {
          if (path.startsWith("/en")) {
            setCurrentLocale("en");
          } else if (path.startsWith("/ja")) {
            setCurrentLocale("ja");
          }
          console.log("Navigating to:", path);
        });
      }, []);

      return (
        <div>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            現在の言語:{" "}
            <strong>{currentLocale === "ja" ? "日本語" : "English"}</strong>
          </div>
          <LanguageSwitcher />
        </div>
      );
    };

    return <InteractiveWrapper />;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("言語を切り替えてみる", async () => {
      // 初期状態を確認
      await expect(canvas.getByText("現在の言語:")).toBeInTheDocument();
      await expect(canvas.getByText("日本語")).toBeInTheDocument();

      // 英語に切り替え
      const enButton = canvas.getByRole("button", { name: "English" });
      await userEvent.click(enButton);

      // 少し待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 日本語に戻す
      const jaButton = canvas.getByRole("button", { name: "日本語" });
      await userEvent.click(jaButton);
    });
  },
};
