import { useMemo } from "react";
import { getCoachMessage } from "@/lib/aiCoach";

export function useAdaptiveCoach(user: any, command: any) {
  return useMemo(() => {
    if (!command) return "";
    return getCoachMessage(user, command);
  }, [user, command]);
}
