import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/providers";
import { useNavigation } from "./navigation";

// テスト用コンポーネント
function TestComponent() {
  const navigation = useNavigation();
  
  return (
    <div>
      <button onClick={() => navigation.push("/test")}>Push</button>
      <button onClick={() => navigation.replace("/test")}>Replace</button>
      <button onClick={() => navigation.back()}>Back</button>
      <button onClick={() => navigation.refresh()}>Refresh</button>
      <div data-testid="params">{JSON.stringify(navigation.params)}</div>
    </div>
  );
}

describe("NavigationProvider", () => {
  it("カスタムナビゲーション関数を提供できる", () => {
    const mockPush = vi.fn();
    const mockReplace = vi.fn();
    const mockBack = vi.fn();
    const mockRefresh = vi.fn();
    
    renderWithProviders(<TestComponent />, {
      navigation: {
        push: mockPush,
        replace: mockReplace,
        back: mockBack,
        refresh: mockRefresh,
        params: { locale: "ja", id: "test123" },
      },
    });
    
    // push関数のテスト
    screen.getByText("Push").click();
    expect(mockPush).toHaveBeenCalledWith("/test");
    
    // replace関数のテスト
    screen.getByText("Replace").click();
    expect(mockReplace).toHaveBeenCalledWith("/test");
    
    // back関数のテスト
    screen.getByText("Back").click();
    expect(mockBack).toHaveBeenCalled();
    
    // refresh関数のテスト
    screen.getByText("Refresh").click();
    expect(mockRefresh).toHaveBeenCalled();
    
    // paramsのテスト
    expect(screen.getByTestId("params")).toHaveTextContent('{"locale":"ja","id":"test123"}');
  });
});