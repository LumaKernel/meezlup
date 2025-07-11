import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import type { ReactNode } from "react";

interface MantineSetupProps {
  readonly children: ReactNode;
}

const theme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), monospace",
  primaryColor: "blue",
});

export function MantineSetup({ children }: MantineSetupProps) {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}
