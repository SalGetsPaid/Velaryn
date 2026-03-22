"use client";

import { useEffect, useState } from "react";
import { useCommandCenter } from "@/hooks/useCommandCenter";
import { getDefaultUserProfile } from "@/lib/wealthEngine";
import { useAICoach } from "@/hooks/useAICoach";
import { useSocialProof } from "@/hooks/useSocialProof";
import SovereignHome from "@/components/SovereignHome";

const DEFAULT_PROFILE = getDefaultUserProfile();

export default function Home() {
  const [decision, setDecision] = useState<any>(null);
  const [events, setEvents] = useState<Array<{ amount: number; date: string }>>([]);

  // Fetch initial decision
  useEffect(() => {
    fetch("/api/decisions")
      .then((res) => res.json())
      .then((data) => setDecision(data.decision));
  }, []);

  // Get command and coaching
  const { command } = useCommandCenter(events, decision);
  const coachMessage = useAICoach(command, {});
  const socialCount = useSocialProof();

  const handleExecute = () => {
    const boostedAmount = Math.round(command.amount);
    setEvents((prev) => [{ amount: boostedAmount, date: new Date().toISOString() }, ...prev]);
    
    fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    }).catch((err) => console.error("Execute failed:", err));
  };

  return (
    <SovereignHome
      action={decision}
      onExecute={handleExecute}
      coachMessages={coachMessage ? [coachMessage] : []}
      socialCount={socialCount}
      streak={DEFAULT_PROFILE.streakCount}
    />
  );
}
