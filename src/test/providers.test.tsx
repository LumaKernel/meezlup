import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./providers";
import { useNavigation, useActions } from "@/lib/providers";
import { consumePromise } from "@/lib/utils/promise";

// テスト用コンポーネント
function TestComponent() {
  const navigation = useNavigation();
  const actions = useActions();
  
  return (
    <div>
      <div data-testid="params">{JSON.stringify(navigation.params)}</div>
      <button onClick={() => { navigation.push("/test"); }}>Navigate</button>
      <button onClick={() => { consumePromise(actions.event.get("123")); }}>Get Event</button>
    </div>
  );
}

describe("renderWithProviders", () => {
  it("NavigationProviderをオーバーライドできる", () => {
    const mockPush = vi.fn();
    
    renderWithProviders(<TestComponent />, {
      navigation: {
        push: mockPush,
        params: { locale: "en", id: "test" },
      },
    });
    
    // パラメータが正しく設定されている
    expect(screen.getByTestId("params")).toHaveTextContent('{"locale":"en","id":"test"}');
    
    // pushがモック関数を呼び出す
    screen.getByText("Navigate").click();
    expect(mockPush).toHaveBeenCalledWith("/test");
  });
  
  it("ActionsProviderをオーバーライドできる", async () => {
    const mockGet = vi.fn().mockResolvedValue({
      success: true,
      data: { id: "event123", name: "Test Event" },
    });
    
    renderWithProviders(<TestComponent />, {
      actions: {
        event: {
          get: mockGet,
        },
      },
    });
    
    // getがモック関数を呼び出す
    screen.getByText("Get Event").click();
    expect(mockGet).toHaveBeenCalledWith("123");
  });
  
  it("デフォルトのプロバイダー値を使用できる", () => {
    renderWithProviders(<TestComponent />);
    
    // デフォルトのparamsは空
    expect(screen.getByTestId("params")).toHaveTextContent("{}");
    
    // ボタンがクリック可能
    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(screen.getByText("Get Event")).toBeInTheDocument();
  });
  
  it("部分的なオーバーライドができる", () => {
    const mockCreate = vi.fn();
    
    renderWithProviders(<TestComponent />, {
      actions: {
        event: {
          create: mockCreate,
          // get, update, deleteはデフォルト値を使用
        },
      },
    });
    
    // ActionsProviderが正しく機能している
    expect(screen.getByText("Get Event")).toBeInTheDocument();
  });
});