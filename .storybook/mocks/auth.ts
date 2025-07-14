// Auth関連のモックデータ型
export interface MockAuthData {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
      id: string;
      email: string;
      name?: string;
      picture?: string;
      nickname?: string;
      emailVerified?: boolean;
    } | null;
    error?: Error;
  };
}

// Storybook用のモック関数（vitestを使わない）
const createMockFunction = () => {
  let calls: Array<unknown[]> = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
    console.log("[Mock] Function called with:", args);
  };
  fn.mockClear = () => {
    calls = [];
  };
  fn.getCalls = () => calls;
  return fn;
};

// モック関数
export const mockLogin = createMockFunction();
export const mockLogout = createMockFunction();

// デフォルトのモックデータ
export const defaultMockAuthData: MockAuthData = {
  auth: {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  },
};

// useAuthフックのモック実装
export const createMockUseAuth = (mockData: MockAuthData["auth"]) => {
  return () => mockData;
};

// useAuthActionsフックのモック実装
export const createMockUseAuthActions = () => {
  return () => ({
    login: mockLogin,
    logout: mockLogout,
  });
};
