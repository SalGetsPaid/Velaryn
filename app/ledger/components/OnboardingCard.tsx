type OnboardingCardProps = {
  step: number;
};

const STEP_COPY = [
  "Connect your first account and verify your baseline numbers.",
  "Forge your first strike to activate compounding momentum.",
  "Review your trust values and lock in your next move.",
  "Complete one daily check-in and preserve your streak.",
  "Unlock advanced modules once core discipline is stable.",
];

export default function OnboardingCard({ step }: OnboardingCardProps) {
  const clampedStep = Math.max(1, Math.min(5, step));

  return (
    <section className="rounded-xl border border-amber-300/20 bg-amber-300/8 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Onboarding</p>
      <p className="mt-2 text-sm text-white">Step {clampedStep} of 5</p>
      <p className="mt-2 text-sm text-zinc-300">{STEP_COPY[clampedStep - 1]}</p>
    </section>
  );
}