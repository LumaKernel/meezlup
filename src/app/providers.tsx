"use client";

import { AuthProvider } from "@/lib/auth/provider";
import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";

interface ProvidersProps {
  readonly children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </AuthProvider>
  );
}