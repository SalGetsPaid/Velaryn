"use client";

import GoldVLogo from "@/components/GoldVLogo";

export default function AppHeader() {
  return (
    <header className="relative mx-auto w-full max-w-3xl rounded-[2.5rem] border border-amber-300/20 bg-black/35 backdrop-blur-xl px-8 py-8 text-center">
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_-20%,rgba(255,215,0,0.15),transparent_55%)]" />
      <div className="relative flex flex-col items-center gap-4">
        <GoldVLogo className="w-16 h-16 md:w-20 md:h-20" />
        <h1 className="velaryn-wordmark">VELARYN</h1>
        <p className="smallcaps-label">Building Wealth, Forging Legacies</p>
      </div>
    </header>
  );
}
