"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Currency, Locale, currencyForLocale, normalizeLocale } from "@/lib/localization";
import { applyAvatarProgress, applyDailyStreak, getStoredUserProfile, normalizeUserProfile, saveUserProfile, type UserProfile } from "@/lib/wealthEngine";

type SovereignPreference = {
  locale: Locale;
  currency: Currency;
  age: number;
  targetAge: number;
};

type SovereignContextValue = {
  pref: SovereignPreference;
  setPref: React.Dispatch<React.SetStateAction<SovereignPreference>>;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeModule: (moduleId: string) => void;
};

const PROFILE_KEY = "velaryn_sovereign_profile";

const SovereignContext = createContext<SovereignContextValue | null>(null);

export function SovereignProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPref] = useState<SovereignPreference>({
    locale: "en-US",
    currency: "USD",
    age: 30,
    targetAge: 65,
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = getStoredUserProfile();

    return normalizeUserProfile(applyAvatarProgress(applyDailyStreak(stored)));
  });

  useEffect(() => {
    const rawProfile = localStorage.getItem(PROFILE_KEY);
    const parsed = rawProfile ? (JSON.parse(rawProfile) as { locale?: string; currency?: Currency; age?: number; targetAge?: number; language?: string }) : null;

    const locale = normalizeLocale(parsed?.locale ?? parsed?.language ?? localStorage.getItem("velaryn_locale"));
    const currency = parsed?.currency ?? currencyForLocale(locale);

    setPref((prev) => ({
      ...prev,
      locale,
      currency,
      age: parsed?.age ?? prev.age,
      targetAge: parsed?.targetAge ?? prev.targetAge,
    }));

    setProfile(normalizeUserProfile(getStoredUserProfile()));
  }, []);

  useEffect(() => {
    const rawProfile = localStorage.getItem(PROFILE_KEY);
    const existing = rawProfile ? (JSON.parse(rawProfile) as Record<string, unknown>) : {};
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        ...existing,
        locale: pref.locale,
        currency: pref.currency,
        age: pref.age,
        targetAge: pref.targetAge,
      })
    );
    localStorage.setItem("velaryn_locale", pref.locale);
  }, [pref]);

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = normalizeUserProfile({ ...prev, ...updates });

      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, []);

  const completeModule = (moduleId: string) => {
    setProfile((prev) => {
      if (prev.completedModules.includes(moduleId)) {
        return prev;
      }

      return normalizeUserProfile({
        ...prev,
        completedModules: [...prev.completedModules, moduleId],
      });
    });
  };

  return (
    <SovereignContext.Provider value={{ pref, setPref, profile, setProfile, updateProfile, completeModule }}>
      <div className={pref.locale === "en-US" ? "font-sans" : "font-serif"}>{children}</div>
    </SovereignContext.Provider>
  );
}

export function useSovereign() {
  const ctx = useContext(SovereignContext);
  if (!ctx) {
    throw new Error("useSovereign must be used inside SovereignProvider");
  }
  return ctx;
}
