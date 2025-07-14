// Storybookでフックをモックするためのヘルパー関数
import { fn } from "@storybook/test";

export const mockHook = <T extends (...args: unknown[]) => unknown>(
  module: Record<string, unknown>,
  hookName: string,
) => {
  const mockFn = fn<T>();
  Object.defineProperty(module, hookName, {
    value: mockFn,
    writable: true,
    configurable: true,
  });
  return mockFn;
};
