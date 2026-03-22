import { useEffect, useState } from "react";

export function useLiveStream() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    return () => eventSource.close();
  }, []);

  return data;
}
