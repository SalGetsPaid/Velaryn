type AICoachCardProps = {
  message: string;
};

export default function AICoachCard({ message }: AICoachCardProps) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-purple-300/20 bg-purple-300/10 p-4">
      <p className="text-xs text-purple-300">AI Coach</p>
      <p className="mt-2 text-sm text-white">{message}</p>
    </div>
  );
}
