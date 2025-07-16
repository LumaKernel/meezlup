import React, { type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/provider";

interface MockAuthProviderProps {
  readonly children: ReactNode;
  readonly authData?: {
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

/**
 * Storybook用のモックAuthProvider
 * parametersで指定されたauthDataを使用してAuthContextを提供する
 */
export function MockAuthProvider({
  children,
  authData,
}: MockAuthProviderProps) {
  const mockAuth = authData || {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  };

  // MockのuseAuth実装
  const mockUseAuth = () => mockAuth;
  const mockUseAuthActions = () => ({
    login: () => console.log("[Mock] Login called"),
    logout: () => console.log("[Mock] Logout called"),
  });

  // AuthProviderのvalueを直接渡す
  return (
    <AuthProvider
      value={{
        auth: mockAuth,
        actions: mockUseAuthActions(),
      }}
    >
      {children}
    </AuthProvider>
  );
}
