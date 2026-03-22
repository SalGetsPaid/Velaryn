type BehaviorAlertProps = {
  score: number;
};

export function BehaviorAlert({ score }: BehaviorAlertProps) {
  if (score > 70) return null;

  return (
    <div className="p-3 border border-red-400/30 bg-red-500/10 text-xs">
      You're disengaging. Take action today to stay on track.
    </div>
  );
}
