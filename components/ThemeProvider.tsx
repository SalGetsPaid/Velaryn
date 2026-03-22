"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="gold"
      enableSystem
      themes={["system", "light", "dark", "gold", "obsidian", "emerald"]}
    >
      {children}
    </NextThemesProvider>
  );
}
