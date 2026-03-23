import ForgeCard from "@/components/ForgeCard";

type BehaviorAlertProps = {
  score: number;
};

export function BehaviorAlert({ score }: BehaviorAlertProps) {
  if (score > 70) return null;

  return (
    <ForgeCard title="Trajectory Warning" className="rounded-[2rem] bg-red-500/10 p-5 shadow-none">
      <p className="text-sm leading-6 text-white">You're disengaging. Take action today to stay on track.</p>
    </ForgeCard>
  );
}
