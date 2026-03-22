interface MetalSpot {
  [key: string]: number | string;
}

export interface MacroMarkers {
  gold: number;
  silver: number;
  dxy: {
    eur: number;
    gbp: number;
    jpy: number;
  };
  usdTrend: number;
}

function pickMetalValue(spots: MetalSpot[], key: string, fallback: number): number {
  const entry = spots.find((spot) => typeof spot[key] === "number");
  const value = entry?.[key];
  return typeof value === "number" ? value : fallback;
}

function computeUsdTrend(eur: number, gbp: number, jpy: number): number {
  // Baseline basket is a reference level; positive values mean relative USD strength.
  const eurStrength = (eur - 0.9) / 0.9;
  const gbpStrength = (gbp - 0.78) / 0.78;
  const jpyStrength = (150 - jpy) / 150;
  return Number((((eurStrength + gbpStrength + jpyStrength) / 3) * 100).toFixed(2));
}

export async function getMacroMarkers(): Promise<MacroMarkers | null> {
  try {
    const [metalsRes, forexRes] = await Promise.all([
      fetch("https://api.metals.live/v1/spot", { cache: "no-store" }),
      fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" }),
    ]);

    if (!metalsRes.ok || !forexRes.ok) {
      throw new Error(`Macro feed error metals=${metalsRes.status} forex=${forexRes.status}`);
    }

    const metals = (await metalsRes.json()) as MetalSpot[];
    const forex = (await forexRes.json()) as {
      rates?: { EUR?: number; GBP?: number; JPY?: number };
    };

    const eur = forex.rates?.EUR ?? 0.92;
    const gbp = forex.rates?.GBP ?? 0.78;
    const jpy = forex.rates?.JPY ?? 150;

    const gold = pickMetalValue(metals, "gold", 2154);
    const silver = pickMetalValue(metals, "silver", 24.9);

    return {
      gold,
      silver,
      dxy: { eur, gbp, jpy },
      usdTrend: computeUsdTrend(eur, gbp, jpy),
    };
  } catch (err) {
    console.error("Macro Feed Interrupted", err);
    return null;
  }
}
