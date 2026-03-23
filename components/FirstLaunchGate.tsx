"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PROFILE_KEY = "velaryn_sovereign_profile";

export default function FirstLaunchGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isLocalPreview =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalPreview) {
      setIsReady(true);
      return;
    }

    const rawProfile = localStorage.getItem(PROFILE_KEY);
    const parsed = rawProfile ? (JSON.parse(rawProfile) as { onboardingComplete?: boolean } | null) : null;
    const isOnboarded = Boolean(parsed?.onboardingComplete);

    if (!isOnboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (isOnboarded && pathname === "/onboarding") {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card max-w-md w-full p-8 rounded-[2rem] text-center">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Onboarding Forge</p>
          <h2 className="text-2xl font-black italic mt-2">INITIATING SOVEREIGN PROFILE</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
