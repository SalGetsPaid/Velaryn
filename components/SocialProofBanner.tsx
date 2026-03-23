import ForgeCard from "@/components/ForgeCard";

type SocialProofBannerProps = {
  count: number;
};

export function SocialProofBanner({ count }: SocialProofBannerProps) {
  return (
    <ForgeCard title="Market Confidence" className="rounded-[2rem] p-6">
      <p className="font-[Playfair_Display] text-3xl text-white">{count.toLocaleString()}</p>
      <p className="mt-2 text-sm text-emerald-300">users executed actions today</p>
    </ForgeCard>
  );
}
