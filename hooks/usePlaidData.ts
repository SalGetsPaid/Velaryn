import { useEffect, useState } from "react";

type PlaidData = {
  accounts: { name: string; balance: number }[];
  transactions: { category: string; amount: number }[];
} | null;

export function usePlaidData(): PlaidData {
  const [data, setData] = useState<PlaidData>(null);

  useEffect(() => {
    fetch("/api/plaid-data")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {
        setData(null); // NEVER crash UI
      });
  }, []);

  return data;
}
