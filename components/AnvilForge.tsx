"use client";

import ForgeStrike from "@/components/ForgeStrike";

export default function AnvilForge({
  onStrike,
  label,
}: {
  onStrike: () => void;
  label: string;
}) {
  return <ForgeStrike label={label} hint="Strike the anvil to enter the Upgrade Forge" onStrike={onStrike} />;
}
