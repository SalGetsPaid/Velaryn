export interface MarketSignal {
  asset: string;
  price: string;
  trend: "Accumulate" | "Extract" | "Observe";
  color: string;
  reason: string;
}

interface AlphaQuote {
  symbol: string;
  price: number;
  changePercent: number;
}

interface CryptoQuote {
  symbol: string;
  price: number;
  changePercent: number;
}

function toUsd(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function trendFromChange(changePercent: number): { trend: MarketSignal["trend"]; color: string; reason: string } {
  if (changePercent <= -2.5) {
    return {
      trend: "Accumulate",
      color: "text-amber-300",
      reason: `Momentum reset (${changePercent.toFixed(2)}% 24h)` ,
    };
  }

  if (changePercent >= 3) {
    return {
      trend: "Extract",
      color: "text-red-500",
      reason: `Overextended move (${changePercent.toFixed(2)}% 24h)`,
    };
  }

  return {
    trend: "Observe",
    color: "text-zinc-500",
    reason: `Consolidating (${changePercent.toFixed(2)}% 24h)`,
  };
}

async function fetchAlphaQuote(symbol: string, key: string): Promise<AlphaQuote | null> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const data = (await response.json()) as { "Global Quote"?: Record<string, string> };
  const quote = data["Global Quote"];
  if (!quote) return null;

  const price = Number(quote["05. price"]);
  const changePercent = Number(String(quote["10. change percent"] ?? "0").replace("%", ""));

  if (!Number.isFinite(price) || !Number.isFinite(changePercent)) return null;

  return { symbol, price, changePercent };
}

async function fetchCryptoQuotes(): Promise<CryptoQuote[]> {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];

  const json = (await response.json()) as {
    bitcoin?: { usd?: number; usd_24h_change?: number };
    ethereum?: { usd?: number; usd_24h_change?: number };
  };

  return [
    {
      symbol: "BTC",
      price: json.bitcoin?.usd ?? 68402,
      changePercent: json.bitcoin?.usd_24h_change ?? -1.2,
    },
    {
      symbol: "ETH",
      price: json.ethereum?.usd ?? 3820,
      changePercent: json.ethereum?.usd_24h_change ?? 0.4,
    },
  ];
}

export async function getMarketSignals(): Promise<MarketSignal[]> {
  const alphaKey = process.env.ALPHA_VANTAGE_KEY;

  if (!alphaKey) {
    return [
      { asset: "BTC", price: "$68,402", trend: "Accumulate", color: "text-amber-300", reason: "RSI Oversold on 4H" },
      { asset: "NVDA", price: "$890.20", trend: "Extract", color: "text-red-500", reason: "Extreme Greed Sentiment" },
      { asset: "ETH", price: "$3,820", trend: "Observe", color: "text-zinc-500", reason: "Consolidating at Resistance" },
    ];
  }

  try {
    const [nvda, crypto] = await Promise.all([
      fetchAlphaQuote("NVDA", alphaKey),
      fetchCryptoQuotes(),
    ]);

    const bySymbol = new Map<string, CryptoQuote>();
    crypto.forEach((c) => bySymbol.set(c.symbol, c));

    const btc = bySymbol.get("BTC") ?? { symbol: "BTC", price: 68402, changePercent: -1.2 };
    const eth = bySymbol.get("ETH") ?? { symbol: "ETH", price: 3820, changePercent: 0.4 };
    const nvdaQuote = nvda ?? { symbol: "NVDA", price: 890.2, changePercent: 3.1 };

    return [btc, nvdaQuote, eth].map((item) => {
      const analysis = trendFromChange(item.changePercent);
      return {
        asset: item.symbol,
        price: toUsd(item.price, item.price < 10 ? 4 : 2),
        trend: analysis.trend,
        color: analysis.color,
        reason: analysis.reason,
      };
    });
  } catch (error) {
    console.error("Market signal fetch failed", error);
    return [
      { asset: "BTC", price: "$68,402", trend: "Accumulate", color: "text-amber-300", reason: "RSI Oversold on 4H" },
      { asset: "NVDA", price: "$890.20", trend: "Extract", color: "text-red-500", reason: "Extreme Greed Sentiment" },
      { asset: "ETH", price: "$3,820", trend: "Observe", color: "text-zinc-500", reason: "Consolidating at Resistance" },
    ];
  }
}
