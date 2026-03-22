import { useEffect, useState } from "react";

export function useSocialProof() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/social-proof")
      .then((res) => res.json())
      .then((data) => setCount(data.executionsToday));
  }, []);

  return count;
}
