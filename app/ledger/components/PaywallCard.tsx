import { getPlanFeatures, type Plan } from "@/app/ledger/types";

type PaywallCardProps = {
  onUpgrade: () => void;
  targetPlan?: Plan;
};

export default function PaywallCard({ onUpgrade, targetPlan = "pro" }: PaywallCardProps) {
  const features = getPlanFeatures(targetPlan);

  return (
    <section className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
      <p className="text-sm font-semibold text-white">Unlock {targetPlan.toUpperCase()}</p>
      <p className="mt-1 text-xs text-zinc-300">Get AI coaching, deeper insights, and automation.</p>

      <ul className="mt-3 space-y-1 text-xs text-violet-100">
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>

      <button
        onClick={onUpgrade}
        className="mt-3 rounded-lg bg-violet-300 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black"
      >
        Upgrade
      </button>
    </section>
  );
}