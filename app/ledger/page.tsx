"use client";

import { useEffect, useState } from "react";
import NextActionCard from "@/components/NextActionCard";
import ProofCard from "@/components/ProofCard";
import RecoveryCard from "@/components/RecoveryCard";
import { useCommandCenter } from "@/hooks/useCommandCenter";

export default function LedgerPage() {
  const [decision, setDecision] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/decisions")
      .then((res) => res.json())
      .then((data) => {
        setDecision(data.decision);
      });
  }, []);

  const { command, recovery, proof } = useCommandCenter(events, decision);

  const handleExecute = () => {
    const newEvent = {
      amount: command.amount,
      date: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Velaryn Ledger</h1>

      <NextActionCard command={command} onExecute={handleExecute} />

      <ProofCard proof={proof} />

      <RecoveryCard recovery={recovery} />
    </div>
  );
}
