"use client";

import { usePlaidLink } from "react-plaid-link";
import { getForgeCTA } from "@/lib/forgeCopy";

export default function PlaidLink({ token }: { token: string }) {
  const { open, ready } = usePlaidLink({
    token,
    onSuccess: async (public_token, metadata) => {
      console.log("Connected:", metadata.institution?.name);

      const response = await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the dashboard with real numbers
        window.location.reload();
      } else {
        console.error("Exchange failed:", data.error);
      }
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl mt-4"
    >
      {getForgeCTA("connect")}
    </button>
  );
}
