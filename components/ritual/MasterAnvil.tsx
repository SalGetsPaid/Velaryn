'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import RealisticAnvil from "./RealisticAnvil";
import ForgeSparks from "./ForgeSparks";

export default function MasterAnvil({
  onStrike,
  auditActionId = "master-anvil-strike",
}: {
  onStrike: () => void | Promise<void>;
  auditActionId?: string;
}) {
  const [strikeCount, setStrikeCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const triggerStrike = () => {
    setStrikeCount((prev) => prev + 1);
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 200);

    try {
      const profileRaw = localStorage.getItem("velaryn_sovereign_profile");
      const profile = profileRaw ? (JSON.parse(profileRaw) as { userId?: string } | null) : null;
      const userId = profile?.userId || "velaryn-user";

      fetch("/api/audit/strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, actionId: auditActionId }),
      }).catch((error) => {
        console.error("Master anvil audit request failed", error);
      });
    } catch (error) {
      console.error("Master anvil audit payload creation failed", error);
    }

    void Promise.resolve(onStrike());
  };

  return (
    <motion.div
      animate={isShaking ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <ForgeSparks key={strikeCount} active={strikeCount > 0} />
      <RealisticAnvil onStrike={triggerStrike} />
    </motion.div>
  );
}
