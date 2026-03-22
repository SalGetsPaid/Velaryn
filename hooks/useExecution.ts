import { requiresApproval } from "@/lib/approval";

export function useExecution() {
  const execute = async (command: any) => {
    if (requiresApproval(command)) {
      return { requiresApproval: true };
    }

    await fetch("/api/dwolla/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });

    return { success: true };
  };

  return { execute };
}
