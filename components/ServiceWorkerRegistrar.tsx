"use client";

import { useEffect } from "react";
import { appendForgeLogEntry } from "@/lib/forgeLog";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(async (error) => {
        await appendForgeLogEntry({
          category: "runtime",
          level: "warning",
          message: `Service worker registration failed: ${error instanceof Error ? error.message : "unknown error"}`,
        });
      });
    });
  }, []);

  return null;
}
