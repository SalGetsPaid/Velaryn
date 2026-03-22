import { useEffect, useState } from "react";

const COACH_MESSAGES = [
  "You're leaving money on the table.",
  "This action builds long-term wealth.",
  "Stay consistent. This compounds.",
];

export function useAICoach(command: any, proof: any) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!command) return;
    const random = COACH_MESSAGES[Math.floor(Math.random() * COACH_MESSAGES.length)];
    setMessage(`${random} → ${command.label}`);
  }, [command]);

  return message;
}
