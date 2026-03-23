import ForgeCard from "@/components/ForgeCard";

type AICoachCardProps = {
  message: string;
};

export default function AICoachCard({ message }: AICoachCardProps) {
  if (!message) return null;

  return (
    <ForgeCard title="AI Coach" className="rounded-[2rem] p-6">
      <p className="text-sm leading-7 text-white">{message}</p>
    </ForgeCard>
  );
}
