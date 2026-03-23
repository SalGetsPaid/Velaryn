import ForgeCard from "@/components/ForgeCard";

export function StreakCard({ streak }: any) {
  return (
    <ForgeCard title="Discipline" className="rounded-[2rem] p-6">
      <p className="font-[Playfair_Display] text-3xl text-white">{streak} days</p>
      <p className="mt-2 text-sm text-zinc-400">consistent execution streak</p>
    </ForgeCard>
  );
}
