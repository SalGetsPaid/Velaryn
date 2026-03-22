"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Archive, Share2, Sparkles, Star, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useDailyForgeBuild } from "@/hooks/useDailyForgeBuild";
import { formatLedgerDate } from "@/app/ledger/types";
import type { ForgeBuildType } from "@/types/forgeBuild";

type DailyForgeBuildProps = {
  referralCode?: string;
  onStreakBonusChange?: (multiplier: number) => void;
};

const FILTERS: Array<{ value: ForgeBuildType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "quote", label: "Quote" },
  { value: "ideology", label: "Ideology" },
  { value: "tip", label: "Tip" },
  { value: "insight", label: "Insight" },
];

export default function DailyForgeBuild({ referralCode = "velaryn", onStreakBonusChange }: DailyForgeBuildProps) {
  const {
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
  } = useDailyForgeBuild();
  const [isOpen, setIsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    onStreakBonusChange?.(streakBonusMultiplier);
  }, [onStreakBonusChange, streakBonusMultiplier]);

  useEffect(() => {
    if (!isNewToday || !build) return;

    setIsOpen(true);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.62 },
      colors: ["#d4af37", "#f5e8c7", "#ffffff"],
    });
    markOpenedToday().catch(() => undefined);
  }, [build, isNewToday, markOpenedToday]);

  if (!build) return null;

  const favoriteActive = favorites.some((entry) => entry.id === build.id);

  const openBuild = () => {
    setIsOpen(true);
    markOpenedToday().catch(() => undefined);
  };

  const handleShare = async () => {
    const referralUrl = typeof window === "undefined" ? "velaryn.app" : `${window.location.origin}/?ref=${referralCode}`;
    const text = `${build.title}\n\n${build.body}${build.author ? `\n\n- ${build.author}` : ""}\n\nBuilt with Velaryn -> ${referralUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({ text, title: "Daily Forge Build" });
        setShareStatus("Build shared.");
        return;
      }

      await navigator.clipboard.writeText(text);
      setShareStatus("Build copied to clipboard.");
    } catch {
      setShareStatus("Share canceled.");
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.015 }}
        onClick={openBuild}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openBuild();
          }
        }}
        role="button"
        tabIndex={0}
        className="group w-full cursor-pointer rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-amber-500/5 to-black/40 p-6 text-left backdrop-blur-xl transition-all hover:border-amber-300/40"
        aria-label="Open daily forge build"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-300" size={22} />
            <div>
              <p className="smallcaps-label text-amber-200/80">Daily Forge Build</p>
              <p className="text-sm text-zinc-400">{formatLedgerDate(new Date())}</p>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300 group-hover:text-amber-200">Open Build</div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <div
              key={filter.value}
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedType(filter.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setSelectedType(filter.value);
                }
              }}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                selectedType === filter.value
                  ? "border-amber-300/45 bg-amber-300/12 text-amber-100"
                  : "border-white/12 text-zinc-400"
              }`}
            >
              {filter.label}
            </div>
          ))}
          <span className="ml-auto rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
            {streakCount} Day Streak
          </span>
        </div>
        {isStreakBonusActive ? (
          <p className="mt-3 text-xs text-emerald-300">Streak Bonus Active: +{Math.round((streakBonusMultiplier - 1) * 100)}% projection boost</p>
        ) : null}
      </motion.div>

      <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="daily-build-archive-heading">
        <div className="mb-3 flex items-center gap-2">
          <Archive className="text-zinc-400" size={16} />
          <h4 id="daily-build-archive-heading" className="text-sm font-semibold text-zinc-200">Daily Build Archive</h4>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Favorites</p>
            <div className="mt-2 space-y-2">
              {favorites.length === 0 ? (
                <p className="text-xs text-zinc-500">No favorites yet.</p>
              ) : (
                favorites.slice(0, 5).map((entry) => (
                  <button
                    key={`favorite-${entry.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedType(entry.type);
                      setIsOpen(true);
                    }}
                    className="w-full rounded-lg border border-white/8 bg-black/25 px-2 py-1.5 text-left text-xs text-zinc-300"
                  >
                    {entry.title}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Recent Builds</p>
            <div className="mt-2 space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-zinc-500">No recent builds yet.</p>
              ) : (
                history.slice(0, 5).map((entry) => (
                  <button
                    key={`history-${entry.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedType(entry.type);
                      setIsOpen(true);
                    }}
                    className="w-full rounded-lg border border-white/8 bg-black/25 px-2 py-1.5 text-left text-xs text-zinc-300"
                  >
                    {entry.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="daily-build-title">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-amber-300/30 bg-zinc-950/95 p-8 shadow-2xl backdrop-blur-3xl"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-zinc-400 hover:text-white"
              aria-label="Close daily forge build"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/40 bg-black">
              <Sparkles className="text-amber-300" size={42} />
            </div>

            <h3 id="daily-build-title" className="mb-2 text-center font-brand text-3xl font-light tracking-tighter text-amber-100">
              {build.title}
            </h3>

            <p className="mb-6 text-center text-[17px] leading-relaxed text-white">{build.body}</p>

            {build.author ? (
              <p className="mb-8 text-center text-sm italic text-zinc-400">- {build.author}</p>
            ) : null}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toggleFavorite(build)}
                className={`flex items-center justify-center gap-2 rounded-2xl border py-4 px-4 text-sm font-semibold transition ${
                  favoriteActive
                    ? "border-amber-300/40 bg-amber-300/20 text-amber-100"
                    : "border-white/25 bg-black/40 text-zinc-200"
                }`}
              >
                <Star size={18} />
                {favoriteActive ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 py-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20"
              >
                <Share2 size={18} />
                Share Build
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Carry This Forge
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500" aria-live="polite">{shareStatus}</p>
            <p className="mt-2 text-center text-[10px] text-zinc-500">Motivational insight only. Not financial advice.</p>
          </motion.div>
        </div>
      ) : null}
    </>
  );
}
