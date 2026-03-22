export const BANK_DEEP_LINKS: Record<string, string> = {
  Chase: "chase://",
  "Bank of America": "bofamobile://",
  "Wells Fargo": "wellsfargo://",
  "Capital One": "capitalone://",
  Citibank: "citimobile://",
  Default: "https://www.plaid.com", // Fallback
};

export const openBankApp = (institutionName: string) => {
  const url = BANK_DEEP_LINKS[institutionName] || BANK_DEEP_LINKS["Default"];

  // This attempts to open the app; if not installed, it does nothing or opens browser
  window.location.href = url;
};
