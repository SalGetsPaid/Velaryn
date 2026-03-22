export function getWealthSignal(): string {
  const signals = [
    "Wealth is built by consistency, not intensity.",
    "Most people focus on income. The wealthy optimize allocation.",
    "Uninvested cash is silent loss.",
    "Your habits compound faster than your returns.",
    "The gap between earning and keeping is where wealth is built.",
    "Small wins compound into enormous results.",
    "Financial freedom starts with awareness.",
    "The best investment is understanding your money.",
  ];

  return signals[Math.floor(Math.random() * signals.length)];
}
