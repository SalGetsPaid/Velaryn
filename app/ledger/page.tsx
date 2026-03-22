"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import AlphaYieldDashboard, { buildAlphaYieldSources } from "@/components/apex/AlphaYieldDashboard";
import DailyForgeBuild from "@/components/DailyForgeBuild";
import ForgeStrike from "@/components/ForgeStrike";
import AlphaPulse from "@/components/AlphaPulse";
import ToggleMemeMultiplier from "@/components/ToggleMemeMultiplier";
import EnforcementProofLayer from "@/components/EnforcementProofLayer";
import LegacyProofCard from "@/components/LegacyProofCard";
import ForgeDuelPanel from "@/components/social/ForgeDuelPanel";
import SovereignAvatarCard from "@/components/social/SovereignAvatarCard";
import QuickWinChallenges from "@/components/social/QuickWinChallenges";
import SquadBoostCard from "@/components/social/SquadBoostCard";
import GrokHorizonCard from "@/components/social/GrokHorizonCard";
import ForgeMomentShare from "@/components/social/ForgeMomentShare";
import SpareChangeForgeCard from "@/components/SpareChangeForgeCard";
import ArbitragePulseCard from "@/components/ArbitragePulseCard";
import SovereignEfficiencyScoreCard from "@/components/SovereignEfficiencyScoreCard";
import TelemetryLedgerCard from "@/components/legal/TelemetryLedgerCard";
import { useSovereign } from "@/components/SovereignProvider";
import { formatCurrency } from "@/lib/localization";
import {
  MANUAL_STRIKES_KEY,
  addReferralProgress,
  applyAvatarProgress,
  applyDailyStreak,
  calculateForgeScore,
  completeQuickWinChallenge,
  getStoredUserProfile,
  saveUserProfile,
} from "@/lib/wealthEngine";
import { decryptLedger, encryptAndStoreLedger } from "@/lib/biometricVault";
import { logForgeEventToChain } from "@/lib/onchain";
import { useOfflineForge } from "@/hooks/useOfflineForge";
import { trackMetric } from "@/lib/metricsClient";
import LedgerAccessState from "@/app/ledger/components/LedgerAccessState";
import LedgerOverviewPanels from "@/app/ledger/components/LedgerOverviewPanels";
import LedgerProjectionPanels from "@/app/ledger/components/LedgerProjectionPanels";
import LedgerTimeline from "@/app/ledger/components/LedgerTimeline";
import LedgerPlaidAssetLink from "@/app/ledger/components/LedgerPlaidAssetLink";
import ForgeWatchlistPanel from "@/app/ledger/components/ForgeWatchlistPanel";
import NextActionCard from "@/app/ledger/components/NextActionCard";
import OnboardingCard from "@/app/ledger/components/OnboardingCard";
import TrustValue from "@/app/ledger/components/TrustValue";
import BehaviorFeedback from "@/app/ledger/components/BehaviorFeedback";
import StreakCard from "@/app/ledger/components/StreakCard";
import DailyCheckIn from "@/app/ledger/components/DailyCheckIn";
import CoachCard from "@/app/ledger/components/CoachCard";
import PaywallCard from "@/app/ledger/components/PaywallCard";
import CommandCard from "@/app/ledger/components/CommandCard";
import ImpactFlash from "@/app/ledger/components/ImpactFlash";
import ProgressSignal from "@/app/ledger/components/ProgressSignal";
import RealExecutionPreview from "@/app/ledger/components/RealExecutionPreview";
import {
  BIOMETRIC_LOCK_KEY,
  baseEvents,
  buildAlphaYieldSeries,
  buildAuditHash,
  buildRealContext,
  executeRealTransfer,
  formatLedgerDate,
  futureImpact,
  getRealAdaptiveCommand,
  generateCoachInsight,
  getLabel,
  getNextBestAction,
  type PlaidAccount,
  parseLedgerDate,
  selectFundingAccount,
  shouldRenderModule,
  type LinkedAccount,
  type ForgeEvent,
  type LedgerSyncResponse,
} from "@/app/ledger/types";

export default function SovereignLedger() {
  const { pref, profile, updateProfile } = useSovereign();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [memeMultiplier, setMemeMultiplier] = useState(false);
  const [dailyBuildMultiplier, setDailyBuildMultiplier] = useState(1);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
  const [events, setEvents] = useState<ForgeEvent[]>(baseEvents);
  const [sync, setSync] = useState<LedgerSyncResponse | null>(null);
  const [lastImpact, setLastImpact] = useState<number | null>(null);
  const lastTrackedCommandRef = useRef<string>("");

  const vaultKeyMaterial = useMemo(() => {
    if (typeof window === "undefined") return "velaryn-vault-bootstrap";

    const existing = localStorage.getItem("velaryn_vault_key_material");
    if (existing) return existing;

    const generated = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("velaryn_vault_key_material", generated);
    return generated;
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(MANUAL_STRIKES_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ForgeEvent[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setEvents([...parsed, ...baseEvents]);
      }
    } catch (error) {
      console.error("Failed to parse manual strike history", error);
    }
  }, []);

  const selectedAssets = useMemo(() => {
    const source = Array.isArray(profile.oracleWatchlist) ? profile.oracleWatchlist : [];
    return source.length > 0 ? source : ["TSLA", "DOGE", "SPX"];
  }, [profile.oracleWatchlist]);

  const { data: syncData } = useQuery({
    queryKey: ["ledger-sync", selectedAssets.join("|")],
    queryFn: async () => {
      const res = await fetch("/api/ledger-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchlist: selectedAssets,
          profile: {
            monthlyIncome: profile.monthlyIncome,
            monthlyExpenses: profile.monthlyExpenses,
            monthlySurplus: profile.monthlySurplus,
            totalForged: profile.totalForged,
          },
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Ledger sync request failed");
      }

      return (await res.json()) as LedgerSyncResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000,
  });

  const { data: linkedAccounts } = useQuery({
    queryKey: ["linked-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/plaid/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "velaryn-user" }),
      });

      if (!res.ok) {
        return [] as LinkedAccount[];
      }

      const json = (await res.json()) as {
        accounts?: Array<{
          account_id: string;
          name: string;
          subtype?: string;
          balances?: { available?: number; current?: number };
        }>;
      };

      return (json.accounts ?? []).map((account) => {
        const subtype = String(account.subtype ?? "").toLowerCase();
        const type: LinkedAccount["type"] =
          subtype.includes("checking") ? "checking" : subtype.includes("savings") ? "savings" : "investment";

        return {
          id: account.account_id,
          name: account.name,
          balance: Number(account.balances?.available ?? account.balances?.current ?? 0),
          type,
          subtype,
        } satisfies PlaidAccount;
      });
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!syncData) return;

    setSync(syncData);
    setMemeMultiplier(syncData.memeMultiplierActive);

    if (syncData.autoStrikeEvent) {
      setEvents((prev) => {
        if (prev.some((event) => event.id === syncData.autoStrikeEvent?.id)) {
          return prev;
        }
        return [syncData.autoStrikeEvent as ForgeEvent, ...prev];
      });
    }

    if (syncData.incomeBoostEvent) {
      setEvents((prev) => {
        if (prev.some((event) => event.id === syncData.incomeBoostEvent?.id)) {
          return prev;
        }
        return [syncData.incomeBoostEvent as ForgeEvent, ...prev];
      });
    }
  }, [syncData]);

  useEffect(() => {
    const loadPlaidToken = async () => {
      try {
        const res = await fetch("/api/plaid", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { link_token?: string };
        if (json.link_token) {
          setPlaidToken(json.link_token);
        }
      } catch (error) {
        console.error("Failed to load Plaid token", error);
      }
    };

    loadPlaidToken();
  }, []);

  const runLedgerBiometricChallenge = useCallback(async () => {
    try {
      const biometricEnabled = localStorage.getItem(BIOMETRIC_LOCK_KEY) !== "false";
      if (!biometricEnabled) {
        setIsUnlocked(true);
        setIsCheckingAuth(false);
        return;
      }

      const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      const isNative = Boolean(capacitor?.isNativePlatform?.());

      if (!isNative) {
        setIsUnlocked(true);
        setIsCheckingAuth(false);
        return;
      }

      const { NativeBiometric } = await import("capacitor-native-biometric");
      const availability = await NativeBiometric.isAvailable({ useFallback: true });

      if (!availability.isAvailable) {
        setIsUnlocked(false);
        setIsCheckingAuth(false);
        return;
      }

      await NativeBiometric.verifyIdentity({
        reason: "Ledger contains sensitive sovereign records",
        title: "Unlock Sovereign Ledger",
        subtitle: "FaceID / Fingerprint required",
        description: "Verify your identity to reveal your archive.",
        maxAttempts: 2,
        useFallback: true,
      });

      try {
        const vaultEvents = await decryptLedger<ForgeEvent[]>(vaultKeyMaterial, BIOMETRIC_LOCK_KEY);
        if (Array.isArray(vaultEvents) && vaultEvents.length > 0) {
          setEvents(vaultEvents);
        }
        setVaultUnlocked(true);
      } catch {
        setVaultUnlocked(true);
      }

      setIsUnlocked(true);
      setIsCheckingAuth(false);
    } catch (error) {
      console.error("Ledger biometric verification failed", error);
      setIsUnlocked(false);
      setIsCheckingAuth(false);
    }
  }, [vaultKeyMaterial]);

  useEffect(() => {
    if (!vaultUnlocked || !isUnlocked) return;

    encryptAndStoreLedger(events.slice(0, 50), vaultKeyMaterial, BIOMETRIC_LOCK_KEY).catch((error) => {
      console.error("Failed to persist encrypted vault", error);
    });
  }, [events, isUnlocked, vaultKeyMaterial, vaultUnlocked]);

  useEffect(() => {
    runLedgerBiometricChallenge();
  }, [runLedgerBiometricChallenge]);

  const totalForged = useMemo(() => {
    return events.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);
  }, [events]);

  const persistManualEvent = useCallback((event: ForgeEvent, previousId?: number) => {
    setEvents((prev) => {
      const withoutPrevious = typeof previousId === "number" ? prev.filter((entry) => entry.id !== previousId) : prev;
      const withoutDuplicate = withoutPrevious.filter((entry) => entry.id !== event.id);
      const nextEvents = [event, ...withoutDuplicate];
      const manual = nextEvents.filter((entry) => entry.id > 3 && entry.id > 0);
      localStorage.setItem(MANUAL_STRIKES_KEY, JSON.stringify(manual.slice(0, 20)));
      return nextEvents;
    });

    if (typeof previousId === "number") {
      return;
    }

    const storedProfile = getStoredUserProfile();
    const nextProfile = {
      ...storedProfile,
      totalForged: Math.max(storedProfile.totalForged, storedProfile.totalForged + Math.max(event.amount, 0)),
      currentNetWorth: Math.max(storedProfile.currentNetWorth, storedProfile.totalForged + Math.max(event.amount, 0)),
    };
    saveUserProfile(nextProfile);
    updateProfile(nextProfile);
  }, [updateProfile]);

  const { queueForgeEvent, isSubmitting, pendingCount, liveMessage } = useOfflineForge({
    syncEvent: async (event) => {
      const privateKey = localStorage.getItem("velaryn_chain_private_key") as `0x${string}` | null;
      const syncedEvent: ForgeEvent = { ...event, syncStatus: "synced" };

      if (privateKey && privateKey.startsWith("0x")) {
        try {
          syncedEvent.txHash = await logForgeEventToChain(syncedEvent, privateKey);
        } catch (error) {
          console.error("On-chain logging failed", error);
        }
      }

      return syncedEvent;
    },
    onQueued: (event) => persistManualEvent(event),
    onSynced: (event, previousId) => persistManualEvent(event, previousId),
  });

  const addManualStrike = useCallback(async () => {
    const amount = 1000;
    const impact = futureImpact(amount);
    const strikeLabel = getLabel("strike", profile.useSimplifiedMode).label;
    const newEvent: ForgeEvent = {
      id: Date.now(),
      type: "GROK_STRIKE",
      title: `Manual ${strikeLabel}: External Asset`,
      amount,
      impact: `+ ${formatCurrency(impact, pref.locale, pref.currency)} (30Y)`,
      date: formatLedgerDate(new Date()),
      grokInsight: "Manual principal decree confirmed. Recurring discipline remains highest-confidence alpha source.",
      syncStatus: navigator.onLine ? "synced" : "pending",
    };

    await queueForgeEvent(newEvent);
  }, [pref.currency, pref.locale, profile.useSimplifiedMode, queueForgeEvent]);

  const addPlaidAssetTrackEvent = useCallback(async () => {
    const amount = 1880;
    const newEvent: ForgeEvent = {
      id: Date.now(),
      type: "ASSET_TRACK",
      title: "Plaid Asset Track: TSLA / SPACEX / DOGE",
      amount,
      impact: `+ ${formatCurrency(Math.round(amount * 12 * 1.35), pref.locale, pref.currency)} strategic watchlist velocity`,
      date: formatLedgerDate(new Date()),
      grokInsight: "Asset-tracking sleeve initialized; speculative exposure should remain capped against core deployment lane.",
    };

    const privateKey = localStorage.getItem("velaryn_chain_private_key") as `0x${string}` | null;
    if (privateKey && privateKey.startsWith("0x")) {
      try {
        const onChainHash = await logForgeEventToChain(newEvent, privateKey);
        newEvent.txHash = onChainHash;
      } catch (error) {
        console.error("On-chain logging failed", error);
      }
    }

    setEvents((prev) => [newEvent, ...prev]);
  }, [pref.currency, pref.locale]);

  const forgeScore = useMemo(() => profile.forgeScore ?? calculateForgeScore(profile), [profile]);
  const modulesToSovereign = Math.max(0, 3 - profile.completedModules.length);
  const monthToDateYield = useMemo(() => {
    const now = new Date();

    return events.reduce((sum, event) => {
      const parsed = parseLedgerDate(event.date);
      if (!parsed) return sum;
      if (parsed.getMonth() !== now.getMonth() || parsed.getFullYear() !== now.getFullYear()) {
        return sum;
      }
      return sum + Math.max(event.amount, 0);
    }, 0);
  }, [events]);
  const shieldRecovery = useMemo(() => {
    return events.reduce((sum, event) => {
      if (event.type !== "SHIELD" && event.type !== "TAX_SHIELD") {
        return sum;
      }
      return sum + Math.max(event.amount, 0);
    }, 0);
  }, [events]);
  const alphaYieldSeries = useMemo(() => {
    return buildAlphaYieldSeries(Math.max(monthToDateYield, 3842.64));
  }, [monthToDateYield]);
  const alphaYieldSources = useMemo(() => {
    return buildAlphaYieldSources({
      autoStrikeAmount: sync?.autoStrikeAmount ?? 412,
      netCashFlow: sync?.netCashFlow ?? 1290.64,
      shieldRecovery,
      useSimplifiedMode: profile.useSimplifiedMode,
    });
  }, [profile.useSimplifiedMode, shieldRecovery, sync?.autoStrikeAmount, sync?.netCashFlow]);
  const monthOverMonthDelta = useMemo(() => {
    const baseline = Math.max(monthToDateYield * 0.89, 1);
    return ((monthToDateYield - baseline) / baseline) * 100;
  }, [monthToDateYield]);
  const squadBoostActive = Boolean(profile.squadBoostUntil && new Date(profile.squadBoostUntil).getTime() > Date.now());
  const auditHash = useMemo(() => buildAuditHash(totalForged, forgeScore), [forgeScore, totalForged]);
  const finalProjectedForge = useMemo(() => {
    const baseProjection = sync?.projectedForge ?? [];
    const boostFactor = (squadBoostActive ? 1.15 : 1) * dailyBuildMultiplier;
    return baseProjection.map((point) => ({
      ...point,
      projected: memeMultiplier ? Math.round(point.projected * 1.8 * boostFactor) : Math.round(point.projected * boostFactor),
    }));
  }, [dailyBuildMultiplier, memeMultiplier, squadBoostActive, sync?.projectedForge]);
  const ascensionNodes = useMemo(() => {
    const projectedValue =
      sync?.oracleInsights?.projected30YWithSelection ??
      finalProjectedForge.at(-1)?.projected ??
      Math.round(totalForged * 2.4);

    return [
      {
        stage: "Debt Alchemist",
        status: "Leak defense and recurring drag neutralization",
        impact: `${Math.round(Math.max(sync?.autoStrikeAmount ?? 450, 450) * 12).toLocaleString()} annual reclaim`,
      },
      {
        stage: "Income Forge",
        status: "Skill-stacked surplus acceleration deployed",
        impact: `${Math.round(Math.max(sync?.netCashFlow ?? 850, 850)).toLocaleString()}/mo surplus`,
      },
      {
        stage: "Auto-Strike",
        status: "Rule-driven monthly deployment active",
        impact: `${Math.round(Math.max(sync?.autoStrikeAmount ?? 0, 300)).toLocaleString()}/mo routed`,
      },
      {
        stage: "Sovereign Arc",
        status: "Compounding trajectory forged across 30 years",
        impact: `${Math.round(projectedValue).toLocaleString()} projected`,
      },
    ];
  }, [finalProjectedForge, sync, totalForged]);

  const labelSet = useMemo(() => {
    return {
      strike: getLabel("strike", profile.useSimplifiedMode),
      pulse: getLabel("alphaPulse", profile.useSimplifiedMode),
    };
  }, [profile.useSimplifiedMode]);
  const nextAction = useMemo(() => getNextBestAction(profile, events), [events, profile]);
  const context = useMemo(() => buildRealContext(events, linkedAccounts ?? []), [events, linkedAccounts]);
  const command = useMemo(() => getRealAdaptiveCommand(profile, events, context, linkedAccounts ?? []), [context, events, linkedAccounts, profile]);
  const fundingAccount = useMemo(() => selectFundingAccount(linkedAccounts ?? []), [linkedAccounts]);
  const total = useMemo(() => events.reduce((s, e) => s + Math.max(e.amount, 0), 0), [events]);
  const insight = useMemo(() => generateCoachInsight(profile, events), [events, profile]);
  const values = useMemo(() => {
    const projected = sync?.oracleInsights?.projected30YWithSelection ?? finalProjectedForge.at(-1)?.projected ?? totalForged;
    return {
      real: totalForged,
      projected,
    };
  }, [finalProjectedForge, sync?.oracleInsights?.projected30YWithSelection, totalForged]);
  const unlockedModules = useMemo(() => {
    const unlocked = ["core"];
    if (forgeScore >= 30 || profile.completedModules.length >= 2) {
      unlocked.push("advanced");
    }
    if (forgeScore >= 55 || profile.completedModules.length >= 4) {
      unlocked.push("pro");
    }
    return unlocked;
  }, [forgeScore, profile.completedModules.length]);
  const activeStep = useMemo(() => {
    if (profile.completedModules.length >= 4) return 5;
    if (profile.streakCount >= 7) return 4;
    if (events.length >= 4) return 3;
    if (totalForged > profile.startingNetWorth) return 2;
    return 1;
  }, [events.length, profile.completedModules.length, profile.startingNetWorth, profile.streakCount, totalForged]);
  const streak = profile.streakCount;
  const checkedInToday = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return profile.lastStreakDate === today;
  }, [profile.lastStreakDate]);
  const latestEvent = events[0] ?? null;

  const handleChallengeComplete = useCallback((challengeId: string) => {
    const next = applyAvatarProgress(completeQuickWinChallenge(getStoredUserProfile(), challengeId));
    saveUserProfile(next);
    updateProfile(next);
  }, [updateProfile]);

  const handleRegisterReferral = useCallback(() => {
    const next = applyAvatarProgress(addReferralProgress(getStoredUserProfile(), 1));
    saveUserProfile(next);
    updateProfile(next);
  }, [updateProfile]);

  const handleDailyCheckIn = useCallback(() => {
    const next = applyAvatarProgress(applyDailyStreak(getStoredUserProfile()));
    saveUserProfile(next);
    updateProfile(next);
  }, [updateProfile]);

  const executeCommand = useCallback(async () => {
    if (fundingAccount) {
      const transfer = await executeRealTransfer(command, fundingAccount);
      if (!transfer.ok) {
        throw new Error("Transfer execution failed");
      }
    }

    const impact = futureImpact(command.amount, 1, 0.1);
    const event: ForgeEvent = {
      id: Date.now(),
      type: "STRIKE",
      title: `Command Execution: ${command.title}`,
      amount: command.amount,
      impact: `+ ${formatCurrency(impact, pref.locale, pref.currency)} projected momentum`,
      date: formatLedgerDate(new Date()),
      syncStatus: navigator.onLine ? "synced" : "pending",
    };

    await queueForgeEvent(event);
    setLastImpact(command.impact);

    void trackMetric({
      userId: profile.referralCode || "velaryn-user",
      event: "command_executed",
      amount: command.amount,
    });
  }, [command, fundingAccount, pref.currency, pref.locale, profile.referralCode, queueForgeEvent]);

  useEffect(() => {
    const commandKey = `${command.title}:${command.amount}`;
    if (lastTrackedCommandRef.current === commandKey) {
      return;
    }

    lastTrackedCommandRef.current = commandKey;
    void trackMetric({
      userId: profile.referralCode || "velaryn-user",
      event: "command_shown",
      amount: command.amount,
    });
  }, [command.amount, command.title, profile.referralCode]);

  if (isCheckingAuth) {
    return <LedgerAccessState mode="checking" />;
  }

  if (!isUnlocked) {
    return <LedgerAccessState mode="blocked" onRetry={runLedgerBiometricChallenge} />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#020202] px-4 py-6 pb-36 text-white md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_22%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <div className="sr-only" aria-live="polite">{liveMessage}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Oracle Expansion</p>
            <p className="mt-1 text-sm text-zinc-200">
              Watchlist: <span className="font-semibold text-amber-200">{selectedAssets.join(", ")}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pendingCount > 0 ? (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
                {pendingCount} Pending Sync
              </span>
            ) : null}
            <button
              onClick={() => updateProfile({ useSimplifiedMode: !profile.useSimplifiedMode })}
              className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-200"
              title="Toggle terminology mode"
            >
              {profile.useSimplifiedMode ? "Switch to Sovereign Mode" : "Use Simplified Labels"}
            </button>
            <button
              onClick={() => setWatchlistOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200"
            >
              <Settings2 size={12} /> Forge Watchlist
            </button>
          </div>
        </div>

        <NextActionCard action={nextAction} />

        <CommandCard command={command} onExecute={executeCommand} locale={pref.locale} currency={pref.currency} />

        <RealExecutionPreview command={command} account={fundingAccount} />

        {lastImpact ? <ImpactFlash impact={lastImpact} locale={pref.locale} currency={pref.currency} /> : null}

        <ProgressSignal total={total} />

        <CoachCard insight={insight} />

        {profile.plan === "free" ? (
          <PaywallCard onUpgrade={() => console.log("upgrade flow")} targetPlan="pro" />
        ) : null}

        <OnboardingCard step={activeStep} />

        <TrustValue real={values.real} projected={values.projected} locale={pref.locale} currency={pref.currency} />

        <BehaviorFeedback events={events} />

        <StreakCard streak={streak} />

        <DailyCheckIn onCheckIn={handleDailyCheckIn} checkedIn={checkedInToday} />

        <AlphaYieldDashboard
          monthToDateValue={values.real}
          monthOverMonthDelta={monthOverMonthDelta}
          chartData={alphaYieldSeries}
          sources={alphaYieldSources}
          auditHash={auditHash}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <DailyForgeBuild referralCode={profile.referralCode} onStreakBonusChange={setDailyBuildMultiplier} />
          <SpareChangeForgeCard />
          <ToggleMemeMultiplier enabled={memeMultiplier} onChange={setMemeMultiplier} />
        </div>

        {unlockedModules.includes("advanced") ? (
          <div className="space-y-4">
            {shouldRenderModule("AlphaPulse", profile) ? (
              <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">{labelSet.pulse.label}</p>
                <p className="mt-1 text-xs text-zinc-500">{labelSet.pulse.helper}</p>
                <div className="mt-3">
                  <AlphaPulse />
                </div>
              </div>
            ) : null}

            {shouldRenderModule("ArbitragePulse", profile) ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <ArbitragePulseCard pulse={sync?.arbitragePulse ?? null} locale={pref.locale} currency={pref.currency} />
                <SovereignEfficiencyScoreCard metrics={sync?.sovereignEfficiency ?? null} locale={pref.locale} currency={pref.currency} />
              </div>
            ) : null}

            {shouldRenderModule("TelemetryLedger", profile) ? <TelemetryLedgerCard /> : null}

            <LedgerOverviewPanels
              totalForged={totalForged}
              locale={pref.locale}
              currency={pref.currency}
              forgeScore={forgeScore}
              modulesToSovereign={modulesToSovereign}
              sync={sync}
              useSimplifiedMode={profile.useSimplifiedMode}
            />

            {sync ? (
              <LedgerProjectionPanels
                ascensionNodes={ascensionNodes}
                projectedForge={finalProjectedForge}
                currentArchiveValue={totalForged}
                useSimplifiedMode={profile.useSimplifiedMode}
              />
            ) : null}

            <LegacyProofCard
              event={latestEvent}
              projectedValue={sync?.oracleInsights?.projected30YWithSelection ?? finalProjectedForge.at(-1)?.projected ?? totalForged}
            />

            <EnforcementProofLayer
              events={events}
              profile={{ monthlySurplus: profile.monthlySurplus }}
            />

            <ForgeMomentShare
              event={latestEvent}
              projectedValue={sync?.oracleInsights?.projected30YWithSelection ?? finalProjectedForge.at(-1)?.projected ?? totalForged}
              referralCode={profile.referralCode}
            />
          </div>
        ) : null}

        {unlockedModules.includes("pro") ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-200">Pro Modules Unlocked</p>
            </div>

            {sync?.oracleInsights ? (
              <div className="grid gap-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Selected Assets</p>
                  <p className="mt-1 text-lg text-white">{sync.oracleInsights.selectedAssets.join(", ")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">30D Momentum</p>
                  <p className="mt-1 text-lg text-emerald-300">{sync.oracleInsights.currentMomentum.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Risk-Adjusted Yield</p>
                  <p className="mt-1 text-lg text-amber-200">{sync.oracleInsights.riskAdjustedYield.toFixed(2)}%</p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <SovereignAvatarCard profile={profile} />
              <QuickWinChallenges profile={profile} onCompleteChallenge={handleChallengeComplete} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {shouldRenderModule("ForgeDuel", profile) ? <ForgeDuelPanel profile={profile} /> : null}
              {shouldRenderModule("SquadBoost", profile) ? <SquadBoostCard profile={profile} onMockReferral={handleRegisterReferral} /> : null}
            </div>

            {shouldRenderModule("GrokHorizon", profile) ? <GrokHorizonCard profile={profile} /> : null}
          </div>
        ) : null}

        {plaidToken ? (
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Asset Bridge</p>
            <div className="mt-3">
              <LedgerPlaidAssetLink token={plaidToken} onAssetTracked={addPlaidAssetTrackEvent} />
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <LedgerTimeline events={events} locale={pref.locale} currency={pref.currency} />
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-3xl px-6">
        <ForgeStrike
          label={`MANUAL ${labelSet.strike.label.toUpperCase()}`}
          hint={labelSet.strike.helper}
          onStrike={addManualStrike}
          disabled={isSubmitting}
          className="border-amber-200/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.28))] backdrop-blur-2xl"
        />
      </div>

      <ForgeWatchlistPanel
        open={watchlistOpen}
        selectedAssets={selectedAssets}
        onClose={() => setWatchlistOpen(false)}
        onChangeAssets={(assets) => updateProfile({ oracleWatchlist: assets })}
      />
    </div>
  );
}
