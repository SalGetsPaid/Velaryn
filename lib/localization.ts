export type Locale = "en-US" | "es-ES" | "fr-FR" | "de-DE";
export type Currency = "USD" | "EUR" | "GBP";

export const i18n: Record<
  Locale,
  {
    currency: Currency;
    symbol: string;
    vault: string;
    wealth: string;
    leak: string;
    execute: string;
    deploy: string;
    trajectory: string;
    oracle: string;
  }
> = {
  "en-US": {
    currency: "USD",
    symbol: "$",
    vault: "SOVEREIGN VAULT",
    wealth: "WEALTH",
    leak: "CAPITAL LEAK DETECTED",
    execute: "EXECUTE",
    deploy: "DEPLOY CAPITAL",
    trajectory: "EQUITY TRAJECTORY",
    oracle: "MARKET ORACLE",
  },
  "es-ES": {
    currency: "EUR",
    symbol: "EUR",
    vault: "BOVEDA SOBERANA",
    wealth: "RIQUEZA",
    leak: "FUGA DE CAPITAL DETECTADA",
    execute: "EJECUTAR",
    deploy: "DESPLEGAR CAPITAL",
    trajectory: "TRAYECTORIA DE CAPITAL",
    oracle: "ORACULO DE MERCADO",
  },
  "fr-FR": {
    currency: "EUR",
    symbol: "EUR",
    vault: "COFFRE SOUVERAIN",
    wealth: "RICHESSE",
    leak: "FUITE DE CAPITAL DETECTEE",
    execute: "EXECUTER",
    deploy: "DEPLOYER LE CAPITAL",
    trajectory: "TRAJECTOIRE DU CAPITAL",
    oracle: "ORACLE DU MARCHE",
  },
  "de-DE": {
    currency: "EUR",
    symbol: "EUR",
    vault: "SOUVERANER TRESOR",
    wealth: "VERMOGEN",
    leak: "KAPITALVERLUST ERKANNT",
    execute: "AUSFUHREN",
    deploy: "KAPITAL EINSETZEN",
    trajectory: "KAPITALVERLAUF",
    oracle: "MARKTORAKEL",
  },
};

export const formatCurrency = (amount: number, locale: Locale, currency: Currency) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function normalizeLocale(input: string | null | undefined): Locale {
  if (!input) return "en-US";
  if (input === "en" || input === "en-US") return "en-US";
  if (input === "es" || input === "es-ES") return "es-ES";
  if (input === "fr" || input === "fr-FR") return "fr-FR";
  if (input === "de" || input === "de-DE") return "de-DE";
  return "en-US";
}

export function currencyForLocale(locale: Locale): Currency {
  return i18n[locale].currency;
}
