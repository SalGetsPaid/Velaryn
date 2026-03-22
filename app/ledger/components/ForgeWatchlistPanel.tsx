"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";

type ForgeWatchlistPanelProps = {
  open: boolean;
  selectedAssets: string[];
  onClose: () => void;
  onChangeAssets: (assets: string[]) => void;
};

const PRESET_OPTIONS = ["TSLA", "SPX", "BTC", "DOGE", "XOM", "GLD", "QQQ", "NVDA", "ETH", "VTI"];
const SOVEREIGN_CORE = ["TSLA", "DOGE", "SPX"];

function sanitizeAsset(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, 10);
}

export default function ForgeWatchlistPanel({
  open,
  selectedAssets,
  onClose,
  onChangeAssets,
}: ForgeWatchlistPanelProps) {
  const [search, setSearch] = useState("");

  const normalizedSelected = useMemo(() => {
    return Array.from(new Set(selectedAssets.map((asset) => sanitizeAsset(asset)).filter(Boolean)));
  }, [selectedAssets]);

  const visibleOptions = useMemo(() => {
    const query = search.trim().toUpperCase();
    const all = Array.from(new Set([...PRESET_OPTIONS, ...normalizedSelected]));
    if (!query) return all;
    return all.filter((asset) => asset.includes(query));
  }, [normalizedSelected, search]);

  const toggleAsset = (asset: string) => {
    if (normalizedSelected.includes(asset)) {
      onChangeAssets(normalizedSelected.filter((entry) => entry !== asset));
      return;
    }

    onChangeAssets([...normalizedSelected, asset]);
  };

  const addCustomAsset = () => {
    const candidate = sanitizeAsset(search);
    if (!candidate) return;
    if (normalizedSelected.includes(candidate)) {
      setSearch("");
      return;
    }

    onChangeAssets([...normalizedSelected, candidate]);
    setSearch("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-4 md:items-center" role="presentation">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-[1.75rem] border border-amber-300/20 bg-zinc-950 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forge-watchlist-heading"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300/80">Forge Watchlist</p>
            <h3 id="forge-watchlist-heading" className="mt-2 text-2xl font-light text-white">Oracle Asset Selection</h3>
            <p className="mt-2 text-sm text-zinc-400">Pick stocks, ETFs, or crypto symbols used by the oracle for momentum-aware strike guidance.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 p-2 text-zinc-300 transition hover:border-amber-300/35 hover:text-white"
            aria-label="Close watchlist panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => onChangeAssets(SOVEREIGN_CORE)}
            className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200"
          >
            Sovereign Core
          </button>
          <button
            onClick={() => onChangeAssets([])}
            className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300"
          >
            Clear
          </button>
          <p className="text-[11px] text-zinc-500">Selected: {normalizedSelected.length}</p>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
          <Search size={14} className="text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search or add ticker (e.g. VOO, ETH)"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <button
            onClick={addCustomAsset}
            className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-1.5 text-amber-300"
            aria-label="Add custom asset"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {visibleOptions.map((asset) => {
            const selected = normalizedSelected.includes(asset);
            return (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                  selected
                    ? "border-amber-300/35 bg-amber-300/10 text-amber-200"
                    : "border-white/10 bg-black/20 text-zinc-200 hover:border-white/20"
                }`}
              >
                <span className="text-sm font-semibold">{asset}</span>
                <span className="text-[10px] uppercase tracking-[0.24em]">{selected ? "Selected" : "Add"}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200"
          >
            Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
}
