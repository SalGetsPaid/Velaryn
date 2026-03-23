import { getIdentityMessage } from "@/lib/identity";
import ForgeCard from "@/components/ForgeCard";

export function IdentityCard({ streak }: any) {
  return (
    <ForgeCard title="Identity" className="rounded-[2rem] p-6">
      <p className="text-sm leading-6 text-white">{getIdentityMessage(streak)}</p>
    </ForgeCard>
  );
}
