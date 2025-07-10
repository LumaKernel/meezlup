"use client";

import { AuthProvider } from "@/lib/auth/provider";
import { Notifications } from "@mantine/notifications";
import "@/lib/i18n/client"; // i18nを初期化
import type { ReactNode } from "react";

interface ProvidersProps {
  readonly children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <Notifications />
      {children}
    </AuthProvider>
  );
}
