import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("classNameを結合できる", () => {
      expect(cn("a", "b")).toBe("a b");
    });

    it("条件付きクラスを処理できる", () => {
      const flag = Math.random() < 0; // 常にfalseだが動的に評価される
      expect(cn("a", flag && "b", "c")).toBe("a c");
    });

    it("重複を除去できる", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });
});
