"use client";

import { AuthProvider } from "@/lib/auth/provider";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@/lib/i18n/client"; // i18nを初期化
import type { ReactNode } from "react";

interface ProvidersProps {
  readonly children: ReactNode;
}

const theme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), monospace",
});

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Notifications />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
