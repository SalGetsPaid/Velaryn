type SocialProofBannerProps = {
  count: number;
};

export function SocialProofBanner({ count }: SocialProofBannerProps) {
  return (
    <div className="p-2 text-xs text-emerald-300">
      {count.toLocaleString()} users executed actions today
    </div>
  );
}
