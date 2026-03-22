"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Layers, Milestone, Send, TrendingUp, Zap } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ForgeStrike from "@/components/ForgeStrike";
import ForgeLoader from "@/components/ForgeLoader";
import { StrategyDossier as StrategyDossierGuardrail } from "@/components/ritual/StrategyDossier";
import { MANUAL_STRIKES_KEY, estimateMonthlySurplus, type StrategyDossier } from "@/lib/wealthEngine";
import { useSovereign } from "@/components/SovereignProvider";

const PROMPT_SUGGESTIONS = [
  "How do I reach $1M in 5 years?",
  "Best way to eliminate $40k in debt fast?",
  "Should I invest in real estate or index funds?",
  "How do I reduce my tax burden this year?",
  "Architect, my surplus is low. Build my Income Forge plan.",
];

export default function AIStrategist() {
  const { profile } = useSovereign();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<StrategyDossier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [decreeStatus, setDecreeStatus] = useState<"SYNCING" | "SETTLED" | "CANCELED" | null>(null);
  const [execution, setExecution] = useState<{
    decreeId: string;
    decisionId: string;
    amount: number;
    receiptMessage: string;
  } | null>(null);

  useEffect(() => {
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (prompt) {
      setQuery(prompt);
    }
  }, []);

  const generateStrategy = async (override?: string) => {
    const finalQuery = (override ?? query).trim();
    if (!finalQuery || loading || !profile) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/strategist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalQuery,
          profile: {
            ...profile,
            currentNetWorth: profile.currentNetWorth,
            monthlySurplus: profile.monthlySurplus || estimateMonthlySurplus(profile),
          },
        }),
      });

      if (!res.ok) throw new Error("Strategy generation failed");
      const data = (await res.json()) as StrategyDossier;
      setResponse(data);

      const monthlySurplus = profile.monthlySurplus || estimateMonthlySurplus(profile);
      const impactBase = Math.max(0, monthlySurplus || 400);
      const logRes = await fetch("/api/ledger-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STRIKE",
          title: `Oracle Execution: ${data.dossier_title}`,
          amount: impactBase,
          impact: `+$${Math.round(impactBase * 12 * 7.61).toLocaleString()} (30Y)`,
        }),
      });

      if (logRes.ok) {
        const ledgerEvent = await logRes.json();
        const raw = localStorage.getItem(MANUAL_STRIKES_KEY);
        const existing = raw ? JSON.parse(raw) as unknown[] : [];
        localStorage.setItem(MANUAL_STRIKES_KEY, JSON.stringify([ledgerEvent, ...existing].slice(0, 20)));
      }
    } catch (err) {
      console.error(err);
      setError("The Forge is momentarily overloaded. Strike again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (prompt && profile) {
      generateStrategy(prompt);
    }
  }, [profile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") generateStrategy();
  };

  const verifyExecutionBiometric = async () => {
    const enabled = localStorage.getItem("velaryn_biometric_lock") !== "false";
    if (!enabled) return true;

    try {
      const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      const isNative = Boolean(capacitor?.isNativePlatform?.());

      if (!isNative) {
        return true;
      }

      const { NativeBiometric } = await import("capacitor-native-biometric");
      // Class 3 (Strong) biometrics required for any capital-movement action.
      // useFallback: false ensures PIN / pattern / swipe are never accepted —
      // only hardware-backed fingerprint or face biometrics qualify (Android API 36 / iOS Face ID).
      const availability = await NativeBiometric.isAvailable({ useFallback: false });
      if (!availability.isAvailable) {
        return false;
      }

      await NativeBiometric.verifyIdentity({
        reason: "Class 3 Strong biometric required to authorize capital movement",
        title: "Authorize Capital Strike",
        subtitle: "Strong biometric required — no PIN fallback",
        description: "Only fingerprint or Face ID may authorize routing capital.",
        maxAttempts: 3,
        useFallback: false,
      });

      return true;
    } catch {
      return false;
    }
  };

  const executeDecree = async () => {
    if (!response || !profile || executeLoading) return;

    setExecuteLoading(true);
    setExecuteError(null);

    try {
      const biometricVerified = await verifyExecutionBiometric();
      if (!biometricVerified) {
        throw new Error("Biometric attestation failed. Execution canceled.");
      }

      const principalId = "velaryn-user";
      const amount = Math.max(250, Math.round((profile.monthlySurplus || estimateMonthlySurplus(profile) || 600) * 0.35));
      const decisionId = `dossier_${Date.now()}`;

      const attestRes = await fetch("/api/attest-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalId,
          actionId: decisionId,
          tier: 4,
          amount,
          annualRate: 0.1,
          years: 1,
          biometricVerified,
        }),
      });

      if (!attestRes.ok) {
        throw new Error("Attestation failed. Please retry.");
      }

      const attestation = await attestRes.json();

      const executeRes = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalId,
          decisionId,
          title: response.dossier_title,
          amount,
          type: "investment",
          tier: 4,
          mathProof: response.math_proof,
          attestation,
        }),
      });

      const result = await executeRes.json();
      if (!executeRes.ok) {
        throw new Error(result?.error || "Execution failed");
      }

      setExecution({
        decreeId: result.decreeId,
        decisionId,
        amount,
        receiptMessage: result.receipt?.message ?? "Decree is syncing with bank rails.",
      });
      setDecreeStatus("SYNCING");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution failed";
      setExecuteError(msg);
    } finally {
      setExecuteLoading(false);
    }
  };

  const cancelPendingDecree = async () => {
    if (!execution || cancelLoading) return;

    setCancelLoading(true);
    setExecuteError(null);
    try {
      const res = await fetch("/api/cancel-decree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decreeId: execution.decreeId,
          principalId: "velaryn-user",
          reason: "Principal requested one-tap cancel from strategist",
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to cancel decree");
      }

      setDecreeStatus("CANCELED");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to cancel decree";
      setExecuteError(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (!execution || decreeStatus !== "SYNCING") return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/decree-status?decreeId=${encodeURIComponent(execution.decreeId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const nextState = data?.decree?.state as "SYNCING" | "SETTLED" | "CANCELED" | undefined;
        if (!nextState) return;
        setDecreeStatus(nextState);
      } catch {
        // Keep optimistic syncing state on transient polling failures.
      }
    }, 4500);

    return () => clearInterval(poll);
  }, [execution, decreeStatus]);

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-36">
      {/* Header */}
      <header className="flex flex-col items-center mb-12">
        <div className="w-px h-12 bg-amber-300/40 mb-4" />
        <h1 className="brand-title text-metallic-gold text-4xl italic">THE ARCHITECT</h1>
        <p className="text-[9px] text-zinc-500 tracking-[0.6em] uppercase mt-2">AI Strategy Command</p>
      </header>

      {profile && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="gilded-card p-4 text-center">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Stage</p>
            <p className="text-sm font-black text-metallic-gold mt-1">{profile.currentNetWorth < 50000 ? "Ascension Oracle" : profile.currentStage}</p>
          </div>
          <div className="gilded-card p-4 text-center">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Income</p>
            <p className="text-sm font-black text-metallic-gold mt-1">${profile.monthlyIncome.toLocaleString()}/mo</p>
          </div>
          <div className="gilded-card p-4 text-center">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">Forged</p>
            <p className="text-sm font-black text-metallic-gold mt-1">${profile.currentNetWorth.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Command input */}
      <div className="gilded-card p-2 mb-4 flex items-center gap-2 bg-zinc-900/50">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="COMMAND: 'How do I reach $1M in 5 years?'"
          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-mono placeholder:text-zinc-700 caret-amber-300"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => generateStrategy()}
          disabled={loading || !query.trim()}
          className="p-3 bg-amber-300 text-black rounded-2xl hover:bg-yellow-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Generate strategy"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Quick-fire prompts */}
      <div className="flex flex-wrap gap-2 mb-10">
        {PROMPT_SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setQuery(prompt);
              generateStrategy(prompt);
            }}
            className="text-[9px] uppercase font-black tracking-widest text-zinc-500 border border-zinc-700/60 px-3 py-1.5 rounded-full hover:border-amber-300/50 hover:text-amber-200 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gilded-card p-8 text-center space-y-3"
          >
            <ForgeLoader />
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
              Forging Your Strategy...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="gilded-card p-6 border border-red-500/30 bg-red-500/5 text-center"
          >
            <p className="text-sm text-zinc-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy Dossier */}
      <AnimatePresence>
        {response && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="gilded-card p-8 border-emerald-500/30 bg-emerald-500/5"
          >
            {/* Dossier header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black italic text-metallic-gold leading-tight">
                {response.dossier_title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[9px] font-black text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap">
                  Stage: {response.current_stage}
                </span>
                <span className="text-[9px] font-black text-amber-300 border border-amber-300/25 px-3 py-1 rounded-full whitespace-nowrap">
                  Boost: {response.forge_score_boost}
                </span>
              </div>
            </div>

            {/* Sequenced Oracle Map */}
            <div className="mb-8 rounded-2xl border border-white/5 bg-black/25 p-5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-4">Sequenced Oracle Map</p>
              <div className="relative space-y-4">
                <div className="absolute left-[12px] top-1 bottom-1 w-px bg-zinc-700/70" />
                {response.steps.map((step, i) => (
                  <motion.div
                    key={`${step.action}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative pl-8"
                  >
                    <span className="absolute left-0 top-1 w-6 h-6 rounded-full border border-amber-300/40 bg-black text-amber-300 text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="rounded-xl border border-zinc-700/60 bg-black/35 p-3">
                      <p className="text-sm text-zinc-200 font-semibold">{step.action}</p>
                      <p className="text-xs text-emerald-400 mt-1">Impact: {step.impact}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Win certainty row */}
            <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Layers size={12} className="text-zinc-600" />
                <p className="text-[10px] font-black text-zinc-500 uppercase italic">
                  Win Certainty: {response.win_certainty}
                </p>
              </div>
              <p className="text-[10px] text-zinc-500">{response.probability_math}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">Mathematical Justification</p>
              <p className="text-xs text-zinc-300 mt-2 font-mono break-words">{response.math_proof}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-amber-300 font-black">Oracle Prompt</p>
              <p className="text-sm text-zinc-300 mt-2">{response.oracle_prompt}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-3">Income Forge Strikes</p>
              <div className="grid md:grid-cols-3 gap-3">
                {response.income_strikes.map((strike) => (
                  <div key={strike.id} className="rounded-xl border border-zinc-700/50 bg-black/30 p-3">
                    <p className="text-xs font-black text-metallic-gold">{strike.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-2">{strike.description}</p>
                    <p className="text-[11px] text-emerald-400 font-black mt-2">Target: {strike.target}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-2xl border border-amber-300/20 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center gap-2">
                  <Milestone size={12} className="text-amber-300" /> Next Milestone
                </p>
                <p className="text-sm text-zinc-300 mt-2">{response.next_milestone}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center gap-2">
                  <Bot size={12} className="text-emerald-400" /> Automated Rule
                </p>
                <p className="text-sm text-zinc-300 mt-2">{response.auto_strike_rule}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {Object.entries(response.projectedNetWorth).map(([horizon, value]) => (
                <div key={horizon} className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-black">{horizon}</p>
                  <p className="text-sm font-black text-metallic-gold mt-1 flex items-center justify-center gap-1">
                    <TrendingUp size={11} className="text-amber-300" /> ${value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Ascension Projection</p>
                <span className="text-[10px] font-black text-amber-300">Forge Score {response.forge_score}</span>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(response.projectedNetWorth).map(([label, value]) => ({ label, value }))}
                  >
                    <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} fontSize={10} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={10} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
                    <Tooltip
                      contentStyle={{ background: "#09090b", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 16 }}
                      formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Projected"]}
                    />
                    <Bar dataKey="value" fill="#d4af37" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => generateStrategy(`Update my full 10-year wealth map using my complete profile: ${query || "current trajectory"}`)}
                className="rounded-full border border-amber-300/25 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-amber-300 hover:border-amber-300/50"
              >
                Ask Architect To Update My Full 10-Year Map
              </button>
              {response.unlocked_module ? (
                <span className="rounded-full border border-emerald-500/25 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-emerald-400">
                  Unlocked Module: {response.unlocked_module}
                </span>
              ) : null}
            </div>

            <StrategyDossierGuardrail
              logicSource={response.probability_math || "Backtested profile cohorts + deterministic compounding model + rule-based stage progression"}
            />

            {/* Execute CTA — ForgeStrike ritual */}
            <div className="mt-6">
              <ForgeStrike
                label="STRIKE ANVIL TO EXECUTE"
                hint="Biometric attestation + pending decree + one-tap cancel"
                onStrike={executeDecree}
                disabled={executeLoading}
                className="border-emerald-500/30 shadow-[0_0_28px_rgba(16,185,129,0.15)]"
              />
              <p className="text-center text-[9px] text-zinc-600 mt-3 flex items-center justify-center gap-1">
                <Zap size={9} className="text-amber-300/40" />
                Seals fiduciary decree flow with attested intent and shadow-ledger sync
              </p>

              {executeError ? (
                <p className="mt-3 text-center text-xs text-red-400">{executeError}</p>
              ) : null}

              {execution ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Decree Lifecycle</p>
                  <p className="mt-2 text-sm text-zinc-300">{execution.receiptMessage}</p>
                  <p className="mt-3 text-[11px] text-zinc-400">
                    Decree {execution.decreeId} • Routed ${execution.amount.toLocaleString()} • Status {decreeStatus ?? "SYNCING"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {decreeStatus === "SYNCING" ? (
                      <button
                        onClick={cancelPendingDecree}
                        disabled={cancelLoading}
                        className="rounded-full border border-red-400/30 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-red-300 hover:border-red-300/60 disabled:opacity-50"
                      >
                        {cancelLoading ? "Canceling..." : "One-Tap Cancel Decree"}
                      </button>
                    ) : null}

                    {decreeStatus === "SETTLED" ? (
                      <span className="rounded-full border border-emerald-400/30 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-emerald-300">
                        Bank Settlement Confirmed
                      </span>
                    ) : null}

                    {decreeStatus === "CANCELED" ? (
                      <span className="rounded-full border border-red-400/30 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-red-300">
                        Decree Canceled Before Settlement
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!response && !loading && !error && (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full border border-zinc-800 flex items-center justify-center">
            <Layers size={24} className="text-zinc-700" />
          </div>
          <p className="text-zinc-600 text-sm">Enter your wealth command above</p>
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest">
            The Architect will forge your path
          </p>
        </div>
      )}
    </div>
  );
}
