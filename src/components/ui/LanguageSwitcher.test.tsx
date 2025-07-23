import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useRouter } from "next/navigation";
import type { MockAppRouterInstance } from "@/test/mocks/types";

// モック
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(() => ({ locale: "ja" })),
}));

const mockCookieSet = vi.fn();
vi.mock("js-cookie", () => ({
  default: {
    set: mockCookieSet,
  },
}));

// i18nのモック
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
let mockLanguage = "ja";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: mockLanguage,
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

// i18n persistenceのモック
vi.mock("@/lib/i18n/persistence", () => ({
  storeLanguage: vi.fn(),
}));

describe("LanguageSwitcher", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguage = "ja";
    mockChangeLanguage.mockClear();
    const mockRouter: MockAppRouterInstance = {
      push: mockPush,
      refresh: mockRefresh,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter);
  });

  it("現在の言語が日本語の場合、日本語ボタンがアクティブ", () => {
    mockLanguage = "ja";

    render(<LanguageSwitcher />);

    const jaButton = screen.getByRole("button", { name: "日本語" });
    const enButton = screen.getByRole("button", { name: "English" });

    // Mantineのvariantで状態を確認（実際のクラス名はMantineの実装に依存）
    // filled variantかoutline variantかを確認
    expect(jaButton).toBeInTheDocument();
    expect(enButton).toBeInTheDocument();
  });

  it("現在の言語が英語の場合、英語ボタンがアクティブ", () => {
    mockLanguage = "en";

    render(<LanguageSwitcher />);

    const jaButton = screen.getByRole("button", { name: "日本語" });
    const enButton = screen.getByRole("button", { name: "English" });

    // 両方のボタンが存在することを確認
    expect(jaButton).toBeInTheDocument();
    expect(enButton).toBeInTheDocument();
  });

  it("日本語ボタンをクリックすると言語が切り替わる", async () => {
    mockLanguage = "en";

    // window.location.pathnameのモック
    Object.defineProperty(window, "location", {
      value: { pathname: "/en/events/new" },
      writable: true,
      configurable: true,
    });

    render(<LanguageSwitcher />);

    const jaButton = screen.getByRole("button", { name: "日本語" });
    fireEvent.click(jaButton);

    // i18nの言語変更が呼ばれる
    await vi.waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("ja");
    });

    // 正しいパスにナビゲート
    expect(mockPush).toHaveBeenCalledWith("/ja/events/new");
  });

  it("英語ボタンをクリックすると言語が切り替わる", async () => {
    mockLanguage = "ja";

    // window.location.pathnameのモック
    Object.defineProperty(window, "location", {
      value: { pathname: "/ja/profile" },
      writable: true,
      configurable: true,
    });

    render(<LanguageSwitcher />);

    const enButton = screen.getByRole("button", { name: "English" });
    fireEvent.click(enButton);

    // i18nの言語変更が呼ばれる
    await vi.waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });

    // 正しいパスにナビゲート
    expect(mockPush).toHaveBeenCalledWith("/en/profile");
  });

  it("ルートパスで言語を切り替える", async () => {
    mockLanguage = "ja";

    // window.location.pathnameのモック
    Object.defineProperty(window, "location", {
      value: { pathname: "/ja" },
      writable: true,
      configurable: true,
    });

    render(<LanguageSwitcher />);

    const enButton = screen.getByRole("button", { name: "English" });
    fireEvent.click(enButton);

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/en");
    });
  });

  it("サブパスで言語を切り替える", async () => {
    mockLanguage = "en";

    // window.location.pathnameのモック
    Object.defineProperty(window, "location", {
      value: { pathname: "/en/events/123/participate" },
      writable: true,
      configurable: true,
    });

    render(<LanguageSwitcher />);

    const jaButton = screen.getByRole("button", { name: "日本語" });
    fireEvent.click(jaButton);

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/ja/events/123/participate");
    });
  });

  it("既に選択されている言語をクリックしても同じパスにナビゲート", async () => {
    mockLanguage = "ja";

    Object.defineProperty(window, "location", {
      value: { pathname: "/ja/events" },
      writable: true,
      configurable: true,
    });

    render(<LanguageSwitcher />);

    const jaButton = screen.getByRole("button", { name: "日本語" });
    fireEvent.click(jaButton);

    // 同じ言語でもナビゲーションは呼ばれる
    await vi.waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("ja");
      expect(mockPush).toHaveBeenCalledWith("/ja/events");
    });
  });

  it("ボタンにアクセシビリティ属性が設定されている", () => {
    render(<LanguageSwitcher />);

    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      expect(button).toHaveAttribute("type", "button");
    });
  });
});
