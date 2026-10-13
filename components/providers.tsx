"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "next-themes";

import { HistoryTransitions } from "@/components/history-transitions";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider forcedTheme="dark" attribute="class">
      {children}
      <HistoryTransitions />
    </ThemeProvider>
  );
}
