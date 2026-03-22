import { NextResponse } from "next/server";
import { generateDecisions } from "@/lib/decisionEngine";
import { evaluateAlphaStrike } from "@/lib/notifications/alphaStrike";
import { logProcessReconstruction } from "@/lib/security/processReconstructionLedger";

type GrokStrikeSuggestion = {
  title: string;
  amount: number;
  impact: string;
  grokInsight: string;
};

type OracleInsights = {
  selectedAssets: string[];
  currentMomentum: number;
  projected30YWithSelection: number;
  riskAdjustedYield: number;
};

const DEFAULT_WATCHLIST = ["TSLA", "DOGE", "SPX"];

type AssetSnapshot = {
  symbol: string;
  price: number;
  momentum30d: number;
  yieldPct: number;
};

function normalizeWatchlist(raw: unknown) {
  if (!Array.isArray(raw)) return [...DEFAULT_WATCHLIST];
  const normalized = Array.from(
    new Set(
      raw
        .map((value) => String(value ?? "").trim().toUpperCase())
        .filter((value) => value.length >= 2 && value.length <= 10)
    )
  );
  return normalized.length > 0 ? normalized.slice(0, 15) : [...DEFAULT_WATCHLIST];
}

function seededValue(seed: string) {
  return [...seed].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 10000, 97);
}

function buildFallbackSnapshot(symbol: string): AssetSnapshot {
  const seed = seededValue(symbol);
  const momentum30d = Number((((seed % 260) - 110) / 10).toFixed(2));
  const yieldPct = Number((((seed % 90) / 10) + (symbol === "GLD" ? 0 : 0.3)).toFixed(2));
  const price = Number((20 + (seed % 1800) / 10).toFixed(2));
  return { symbol, price, momentum30d, yieldPct };
}

async function fetchAssetSnapshot(symbol: string): Promise<AssetSnapshot> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return buildFallbackSnapshot(symbol);
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return buildFallbackSnapshot(symbol);
    }

    const data = (await response.json()) as {
      [key: string]: unknown;
      "Time Series (Daily)"?: Record<string, Record<string, string>>;
    };

    const series = data["Time Series (Daily)"];
    if (!series) {
      return buildFallbackSnapshot(symbol);
    }

    const days = Object.keys(series).sort((a, b) => (a < b ? 1 : -1));
    if (days.length < 2) {
      return buildFallbackSnapshot(symbol);
    }

    const latest = series[days[0]];
    const lookback = series[days[Math.min(29, days.length - 1)]];
    const latestClose = Number(latest?.["4. close"] ?? latest?.["5. adjusted close"] ?? 0);
    const lookbackClose = Number(lookback?.["4. close"] ?? lookback?.["5. adjusted close"] ?? 0);
    const dividend30d = days.slice(0, 30).reduce((sum, day) => {
      const dividend = Number(series[day]?.["7. dividend amount"] ?? 0);
      return sum + (Number.isFinite(dividend) ? dividend : 0);
    }, 0);

    if (!(latestClose > 0) || !(lookbackClose > 0)) {
      return buildFallbackSnapshot(symbol);
    }

    const momentum30d = ((latestClose - lookbackClose) / lookbackClose) * 100;
    const yieldPct = (dividend30d / latestClose) * 100;

    return {
      symbol,
      price: Number(latestClose.toFixed(2)),
      momentum30d: Number(momentum30d.toFixed(2)),
      yieldPct: Number(yieldPct.toFixed(2)),
    };
  } catch {
    return buildFallbackSnapshot(symbol);
  }
}

function buildOracleInsights(
  selectedAssets: string[],
  snapshots: AssetSnapshot[],
  projectedForge: Array<{ label: string; projected: number }>
): OracleInsights {
  const avgMomentum = snapshots.length
    ? snapshots.reduce((sum, entry) => sum + entry.momentum30d, 0) / snapshots.length
    : 0;
  const avgYield = snapshots.length
    ? snapshots.reduce((sum, entry) => sum + entry.yieldPct, 0) / snapshots.length
    : 0;

  const riskAdjustedYield = Number((7 + avgYield * 0.35 + avgMomentum * 0.05).toFixed(2));
  const baseProjection = projectedForge.at(-1)?.projected ?? 0;
  const projectionAdjust = Math.max(-0.18, Math.min(0.4, avgMomentum / 100 * 0.2 + avgYield / 100 * 0.15));
  const projected30YWithSelection = Math.round(baseProjection * (1 + projectionAdjust));

  return {
    selectedAssets,
    currentMomentum: Number(avgMomentum.toFixed(2)),
    projected30YWithSelection,
    riskAdjustedYield,
  };
}

async function fetchGrokStrike(
  totalForged: number,
  forgeScore: number,
  profile: Record<string, unknown>,
  watchlist: string[],
  oracleInsights: OracleInsights
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/grok-strike`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalForged,
        forgeScore,
        profile,
        watchlist,
        oracleInsights,
      }),
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as GrokStrikeSuggestion;
  } catch {
    return null;
  }
}

function buildPseudoOnChainHash(seed: number) {
  const normalized = Math.abs(seed).toString(16).padStart(64, "0");
  return `0x${normalized.slice(0, 64)}`;
}

function buildProjectedForge(startingValue: number, monthlyContribution: number, annualRate = 0.07) {
  const points = [0, 1, 5, 10, 20, 30];
  const monthlyRate = annualRate / 12;

  return points.map((year) => {
    if (year === 0) {
      return { label: "Now", projected: Math.round(startingValue) };
    }

    const months = year * 12;
    const growth = Math.pow(1 + monthlyRate, months);
    const projected = Math.round(
      startingValue * growth + monthlyContribution * ((growth - 1) / monthlyRate)
    );

    return { label: `${year}Y`, projected };
  });
}

function buildArbitragePulse(netCashFlow: number, cashBuffer: number) {
  const spreadCapturedToday = Number(Math.max(0, netCashFlow * 0.0125).toFixed(2));
  const annualizedYieldCapture = Math.round((spreadCapturedToday * 365) + Math.max(0, cashBuffer * 0.014));

  return {
    rail: "FedNow/RTP" as const,
    captureRateBps: 42,
    annualizedYieldCapture,
    status: netCashFlow > 0 ? ("active" as const) : ("warming" as const),
    spreadCapturedToday,
    nextSettlementWindow: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
  };
}

function buildSovereignEfficiency(netCashFlow: number, totalCash: number) {
  const idleCash = Math.max(totalCash - Math.max(0, netCashFlow * 3), 0);
  const workingCapitalRatio = totalCash > 0 ? Number((Math.max(totalCash - idleCash, 0) / totalCash).toFixed(2)) : 0;
  const efficiencyDragPct = totalCash > 0 ? Number(((idleCash / totalCash) * 100).toFixed(2)) : 100;
  const scoreBase = Math.round(workingCapitalRatio * 100 - Math.min(45, efficiencyDragPct * 0.35) + Math.min(20, netCashFlow / 120));
  const score = Math.max(1, Math.min(100, scoreBase));

  return {
    score,
    label: score >= 80 ? ("Elite" as const) : score >= 55 ? ("Tactical" as const) : ("Dormant" as const),
    efficiencyDragPct,
    idleCash: Number(idleCash.toFixed(2)),
    workingCapitalRatio,
  };
}

async function handleSync(req?: Request) {
  try {
    const body = req ? ((await req.json().catch(() => ({}))) as { watchlist?: string[]; profile?: Record<string, unknown> }) : {};
    const selectedAssets = normalizeWatchlist(body.watchlist);

    const demoData = {
      cash: 18200,
      income: 6200,
      categoryMap: { Dining: 1240, Shopping: 890, Housing: 2100, Debt: 640 },
      monthlyExpenses: 4780,
    };

    const decisions = generateDecisions(demoData);
    const netCashFlow = demoData.income - demoData.monthlyExpenses;
    const autoStrikeAmount = Math.round(netCashFlow * 0.65);
    const annualExpansionOpportunity = Math.round(autoStrikeAmount * 12 * 1.8);
    const portfolioYieldDeltaPct = demoData.cash > 0
      ? Number(((annualExpansionOpportunity / demoData.cash) * 100).toFixed(2))
      : 0;
    const alphaStrike = evaluateAlphaStrike(
      {
        dailySubscriptionCost: 49 / 30,
        principalLabel: "Principal",
      },
      annualExpansionOpportunity,
      portfolioYieldDeltaPct
    );

    const suggestion =
      netCashFlow > 0
        ? `You have $${netCashFlow}/mo surplus -> auto-deploy $${autoStrikeAmount}/mo into ${netCashFlow > 1000 ? "Capital Velocity" : "Debt Alchemy"}?`
        : "Cash flow is negative -> stabilize expenses before auto-strikes activate.";

    const projectedForge = buildProjectedForge(demoData.cash, Math.max(autoStrikeAmount, 0));
    const snapshots = await Promise.all(selectedAssets.map((symbol) => fetchAssetSnapshot(symbol)));
    const oracleInsights = buildOracleInsights(selectedAssets, snapshots, projectedForge);
    const arbitragePulse = buildArbitragePulse(netCashFlow, demoData.cash);
    const sovereignEfficiency = buildSovereignEfficiency(netCashFlow, demoData.cash);

    const grokStrike = await fetchGrokStrike(demoData.cash, 72, {
      monthlyIncome: demoData.income,
      monthlyExpenses: demoData.monthlyExpenses,
      netCashFlow,
        ...body.profile,
      }, selectedAssets, oracleInsights);

    const autoStrikeEvent = netCashFlow > 0
      ? {
          id: -101,
          type: "STRIKE",
          title: grokStrike?.title ?? "Auto-Strike Opportunity",
          amount: grokStrike?.amount ?? autoStrikeAmount,
          impact: grokStrike?.impact ?? `+$${Math.round(autoStrikeAmount * 12 * 1.8).toLocaleString()} strategic redeployment value`,
          date: "SYSTEM GENERATED",
          txHash: buildPseudoOnChainHash(autoStrikeAmount * 1703),
          grokInsight: grokStrike?.grokInsight ?? "AI velocity model suggests recurring deployment while preserving liquidity guardrails.",
        }
      : null;

    logProcessReconstruction({
      route: "/api/ledger-sync",
      principalId: "velaryn-user",
      objective: "Continuously route surplus to productive deployment while logging model reasoning.",
      inputs: {
        watchlist: selectedAssets,
        netCashFlow,
        monthlyExpenses: demoData.monthlyExpenses,
      },
      reasoningPath: [
        "Normalize user watchlist and derive market snapshots.",
        "Compute net cash flow and baseline auto-strike deployment amount.",
        "Estimate RTP/FedNow spread capture using current surplus velocity.",
        "Score sovereign efficiency from working-capital utilization versus idle drag.",
        "Emit recommendation and auto-strike event for downstream ledger rendering.",
      ],
      outcome: {
        autoStrikeAmount,
        arbitrageStatus: arbitragePulse.status,
        sovereignEfficiencyScore: sovereignEfficiency.score,
      },
      complianceBasis: ["CO_AI_ACT_2026", "PROCESS_RECONSTRUCTION_LEDGER"],
    }).catch((error) => {
      console.error("Process reconstruction log failed", error);
    });

    return NextResponse.json({
      netCashFlow,
      autoStrikeAmount,
      suggestion,
      alphaStrike,
      alphaPulse: "Momentum is constructive. Keep core deployment disciplined; trim speculative drift.",
      memeMultiplierActive: false,
      arbitragePulse,
      sovereignEfficiency,
      projectedForge,
      oracleInsights,
      incomeBoostEvent: netCashFlow > 1000
        ? {
            id: -102,
            type: "INCOME_BOOST",
            title: "Income Boost Detected",
            amount: netCashFlow,
            impact: `+$${Math.round(netCashFlow * 12).toLocaleString()} annual surplus capacity`,
            date: "SYSTEM GENERATED",
          }
        : null,
      autoStrikeEvent,
      plaidWebhookStub: {
        endpoint: "/api/plaid/webhook",
        expectedEvent: "TRANSACTIONS_DEFAULT_UPDATE",
      },
      topDecision: decisions[0] ?? null,
    });
  } catch (error) {
    console.error("Ledger sync failed", error);
    return NextResponse.json({ error: "Ledger sync failed" }, { status: 500 });
  }
}

export async function GET() {
  return handleSync();
}

export async function POST(req: Request) {
  return handleSync(req);
}