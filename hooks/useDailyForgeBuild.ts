"use client";

import { useEffect, useState } from "react";
import { useVault } from "@/lib/biometricVault";
import { dailyForgeBuilds } from "@/data/dailyForgeBuilds";
import type { DailyForgeBuild } from "@/types/forgeBuild";
import type { ForgeBuildType } from "@/types/forgeBuild";

const LAST_SEEN_KEY = "dailyForgeBuildLastSeen";
const TODAY_BUILD_KEY_PREFIX = "dailyForgeBuildToday";
const LAST_OPENED_KEY = "dailyForgeBuildLastOpened";
const STREAK_KEY = "dailyForgeBuildStreak";
const FAVORITES_KEY = "dailyForgeBuildFavorites";
const HISTORY_KEY = "dailyForgeBuildHistory";

type BuildFilter = ForgeBuildType | "all";

function dayKey(value: Date) {
  return value.toISOString().split("T")[0];
}

function dailyIndex(dateIso: string) {
  return dateIso
    .split("-")
    .map((value) => Number.parseInt(value, 10))
    .reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
}

function yesterdayKey(now: Date) {
  const previous = new Date(now);
  previous.setDate(previous.getDate() - 1);
  return dayKey(previous);
}

function uniqueById(builds: DailyForgeBuild[]) {
  const map = new Map<number, DailyForgeBuild>();
  builds.forEach((build) => {
    map.set(build.id, build);
  });
  return Array.from(map.values());
}

export function useDailyForgeBuild() {
  const { getVaultData, setVaultData } = useVault();
  const [build, setBuild] = useState<DailyForgeBuild | null>(null);
  const [isNewToday, setIsNewToday] = useState(false);
  const [selectedType, setSelectedType] = useState<BuildFilter>("all");
  const [streakCount, setStreakCount] = useState(0);
  const [favorites, setFavorites] = useState<DailyForgeBuild[]>([]);
  const [history, setHistory] = useState<DailyForgeBuild[]>([]);

  const isStreakBonusActive = streakCount >= 7;
  const streakBonusMultiplier = isStreakBonusActive ? 1.1 : 1;

  useEffect(() => {
    let active = true;

    const resolveBuild = async () => {
      const today = new Date().toISOString().split("T")[0];
      const lastSeen = await getVaultData<string>(LAST_SEEN_KEY);
      const filteredBuilds = selectedType === "all"
        ? dailyForgeBuilds
        : dailyForgeBuilds.filter((entry) => entry.type === selectedType);
      const buildPool = filteredBuilds.length > 0 ? filteredBuilds : dailyForgeBuilds;
      const todayBuildKey = `${TODAY_BUILD_KEY_PREFIX}:${selectedType}`;

      if (lastSeen !== today) {
        const index = dailyIndex(today) % buildPool.length;
        const todaysBuild = buildPool[index];

        if (!active) return;
        setBuild(todaysBuild);
        setIsNewToday(true);

        await setVaultData(LAST_SEEN_KEY, today);
        await setVaultData(todayBuildKey, todaysBuild);

        const existingHistory = (await getVaultData<DailyForgeBuild[]>(HISTORY_KEY)) ?? [];
        const nextHistory = uniqueById([todaysBuild, ...existingHistory]).slice(0, 30);
        await setVaultData(HISTORY_KEY, nextHistory);
        if (active) {
          setHistory(nextHistory);
        }
        return;
      }

      const cached = await getVaultData<DailyForgeBuild>(todayBuildKey);
      if (!active) return;

      if (cached) {
        setBuild(cached);
        setIsNewToday(false);
        return;
      }

      const fallback = buildPool[dailyIndex(today) % buildPool.length];
      setBuild(fallback);
      setIsNewToday(false);

      const existingHistory = (await getVaultData<DailyForgeBuild[]>(HISTORY_KEY)) ?? [];
      setHistory(existingHistory);
    };

    resolveBuild().catch(() => {
      const today = new Date().toISOString().split("T")[0];
      const filteredBuilds = selectedType === "all"
        ? dailyForgeBuilds
        : dailyForgeBuilds.filter((entry) => entry.type === selectedType);
      const buildPool = filteredBuilds.length > 0 ? filteredBuilds : dailyForgeBuilds;
      const fallback = buildPool[dailyIndex(today) % buildPool.length];
      if (active) {
        setBuild(fallback);
      }
    });

    return () => {
      active = false;
    };
  }, [getVaultData, selectedType, setVaultData]);

  useEffect(() => {
    let active = true;

    const loadCollections = async () => {
      const favoritesList = (await getVaultData<DailyForgeBuild[]>(FAVORITES_KEY)) ?? [];
      const historyList = (await getVaultData<DailyForgeBuild[]>(HISTORY_KEY)) ?? [];
      const streak = (await getVaultData<number>(STREAK_KEY)) ?? 0;

      if (!active) return;
      setFavorites(favoritesList);
      setHistory(historyList);
      setStreakCount(streak);
    };

    loadCollections().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [getVaultData]);

  const markOpenedToday = async () => {
    const today = dayKey(new Date());
    const lastOpened = await getVaultData<string>(LAST_OPENED_KEY);

    if (lastOpened === today) {
      return streakCount;
    }

    const previousStreak = (await getVaultData<number>(STREAK_KEY)) ?? 0;
    const nextStreak = lastOpened === yesterdayKey(new Date()) ? previousStreak + 1 : 1;

    await setVaultData(LAST_OPENED_KEY, today);
    await setVaultData(STREAK_KEY, nextStreak);
    setStreakCount(nextStreak);
    return nextStreak;
  };

  const toggleFavorite = async (target: DailyForgeBuild) => {
    const existing = (await getVaultData<DailyForgeBuild[]>(FAVORITES_KEY)) ?? [];
    const isFavorite = existing.some((entry) => entry.id === target.id);
    const next = isFavorite
      ? existing.filter((entry) => entry.id !== target.id)
      : [target, ...existing].slice(0, 20);

    await setVaultData(FAVORITES_KEY, next);
    setFavorites(next);
  };

  return {
    build,
    isNewToday,
    selectedType,
    setSelectedType,
    favorites,
    history,
    streakCount,
    isStreakBonusActive,
    streakBonusMultiplier,
    markOpenedToday,
    toggleFavorite,
  };
}
