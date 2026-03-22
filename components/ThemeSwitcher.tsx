"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useVault } from "@/lib/biometricVault";

const themes = ["gold", "obsidian", "emerald"] as const;
type AccentTheme = (typeof themes)[number];
const VAULT_THEME_KEY = "accentTheme";

export default function ThemeSwitcher() {
  const { setTheme } = useTheme();
  const { getVaultData, setVaultData } = useVault();
  const [activeTheme, setActiveTheme] = useState<AccentTheme>("gold");

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const stored = await getVaultData<string>(VAULT_THEME_KEY);
      const nextTheme = themes.includes((stored ?? "") as AccentTheme) ? (stored as AccentTheme) : "gold";
      if (!mounted) return;

      setActiveTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      setTheme(nextTheme);
    };

    bootstrap().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [getVaultData, setTheme]);

  const applyTheme = async (theme: AccentTheme) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    setTheme(theme);
    await setVaultData(VAULT_THEME_KEY, theme);
  };

  return (
    <div className="flex gap-4">
      {themes.map((theme) => (
        <button
          key={theme}
          onClick={() => applyTheme(theme)}
          aria-label={`Switch to ${theme} theme`}
          className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${
            activeTheme === theme ? "border-white" : "border-zinc-700"
          } ${
            theme === "gold"
              ? "bg-[#E8C547]"
              : theme === "obsidian"
              ? "bg-gray-400"
              : "bg-[#34D399]"
          }`}
        />
      ))}
    </div>
  );
}
