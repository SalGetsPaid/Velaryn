"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlaidLink } from "react-plaid-link";
import { useVault } from "@/lib/biometricVault";
import { logForgeEventToChain } from "@/lib/onchain";
import type { ForgeEvent } from "@/app/ledger/types";

type PlaidTransaction = {
  amount: number;
  name?: string;
  merchant_name?: string;
};

const PENDING_MICRO_STRIKES_KEY = "pendingMicroStrikes";
const PLAID_LINK_TOKEN_KEY = "plaidLinkToken";
const ROUND_UPS_ENABLED_KEY = "roundUpsEnabled";

export function useSpareChangeForge() {
  const { getVaultData, setVaultData } = useVault();
  const queryClient = useQueryClient();
  const [microStrikes, setMicroStrikes] = useState<ForgeEvent[]>([]);
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null);
  const [roundUpsEnabled, setRoundUpsEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const [storedStrikes, storedToken, enabled] = await Promise.all([
        getVaultData<ForgeEvent[]>(PENDING_MICRO_STRIKES_KEY),
        getVaultData<string>(PLAID_LINK_TOKEN_KEY),
        getVaultData<boolean>(ROUND_UPS_ENABLED_KEY),
      ]);

      if (!mounted) return;

      setMicroStrikes(Array.isArray(storedStrikes) ? storedStrikes : []);
      if (typeof storedToken === "string" && storedToken.length > 0) {
        setPlaidLinkToken(storedToken);
      }
      setRoundUpsEnabled(Boolean(enabled));
    };

    bootstrap().catch((error) => {
      console.error("Failed to bootstrap spare-change forge", error);
    });

    return () => {
      mounted = false;
    };
  }, [getVaultData]);

  useEffect(() => {
    if (plaidLinkToken) return;

    const loadPlaidToken = async () => {
      try {
        const res = await fetch("/api/plaid", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { link_token?: string };
        if (!json.link_token) return;

        setPlaidLinkToken(json.link_token);
        await setVaultData(PLAID_LINK_TOKEN_KEY, json.link_token);
      } catch (error) {
        console.error("Failed to load plaid link token for round-ups", error);
      }
    };

    loadPlaidToken().catch(() => undefined);
  }, [plaidLinkToken, setVaultData]);

  const fetchTransactions = useCallback(async () => {
    const res = await fetch("/api/plaid/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "velaryn-user" }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Plaid transactions");
    }

    const payload = (await res.json()) as { transactions?: PlaidTransaction[] };
    const transactions = Array.isArray(payload.transactions) ? payload.transactions : [];

    const generated = transactions.reduce<ForgeEvent[]>((acc, tx, index) => {
      const rounded = Math.ceil(tx.amount);
      const spare = Number((rounded - tx.amount).toFixed(2));

      if (spare < 0.01) {
        return acc;
      }

      acc.push({
        id: Date.now() + index,
        type: "MICRO_STRIKE",
        title: `Penny Forge from ${tx.merchant_name || tx.name || "Purchase"}`,
        amount: spare,
        impact: `+ $${spare.toFixed(2)} compounding`,
        date: new Date().toISOString(),
        roundUpAmount: spare,
        originalTransaction: tx.merchant_name || tx.name || "Purchase",
        syncStatus: navigator.onLine ? "synced" : "pending",
      });
      return acc;
    }, []);

    setMicroStrikes(generated);
    await setVaultData(PENDING_MICRO_STRIKES_KEY, generated);
  }, [setVaultData]);

  useEffect(() => {
    if (!roundUpsEnabled) return;

    fetchTransactions().catch((error) => {
      console.error("Failed to fetch spare-change transactions", error);
    });
  }, [fetchTransactions, roundUpsEnabled]);

  const deployMicroStrikes = useMutation({
    mutationFn: async (strikes: ForgeEvent[]) => {
      const total = strikes.reduce((sum, strike) => sum + (strike.roundUpAmount || 0), 0);

      await fetch("/api/auto-strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total, source: "spare-change" }),
      });

      const privateKey = localStorage.getItem("velaryn_chain_private_key") as `0x${string}` | null;
      if (privateKey?.startsWith("0x")) {
        for (const strike of strikes) {
          try {
            await logForgeEventToChain(strike, privateKey);
          } catch (error) {
            console.error("Failed to log micro-strike to chain", error);
          }
        }
      }

      return strikes;
    },
    onSuccess: async () => {
      await setVaultData(PENDING_MICRO_STRIKES_KEY, []);
      setMicroStrikes([]);
      queryClient.invalidateQueries({ queryKey: ["events"] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["ledger-sync"] }).catch(() => undefined);
    },
  });

  const { open, ready } = usePlaidLink({
    token: plaidLinkToken ?? "",
    onSuccess: async (publicToken) => {
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });

        if (!res.ok) {
          throw new Error("Plaid exchange failed");
        }

        setRoundUpsEnabled(true);
        await setVaultData(ROUND_UPS_ENABLED_KEY, true);
        await fetchTransactions();
      } catch (error) {
        console.error("Failed to enable spare-change round-ups", error);
      }
    },
  });

  const totalCapturedToday = useMemo(() => {
    return microStrikes.reduce((sum, strike) => sum + (strike.roundUpAmount || 0), 0);
  }, [microStrikes]);

  return {
    microStrikes,
    ready,
    totalCapturedToday,
    enableRoundUps: open,
    deployNow: () => deployMicroStrikes.mutate(microStrikes),
    isDeploying: deployMicroStrikes.isPending,
  };
}
