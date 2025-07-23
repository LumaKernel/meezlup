import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { Button } from "./Button";

describe("Button", () => {
  it("テキストを表示する", () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByText("テストボタン")).toBeInTheDocument();
  });

  it("ローディング状態を表示する", () => {
    render(<Button loading>送信</Button>);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("無効化されている", () => {
    render(<Button disabled>無効ボタン</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
