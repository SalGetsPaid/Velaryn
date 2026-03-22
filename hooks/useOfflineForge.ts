"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ForgeEvent } from "@/app/ledger/types";
import {
  countQueuedForgeEvents,
  enqueueForgeEvent,
  listQueuedForgeEvents,
  removeQueuedForgeEvent,
} from "@/lib/offlineQueue";
import { appendForgeLogEntry } from "@/lib/forgeLog";

type UseOfflineForgeOptions = {
  syncEvent: (event: ForgeEvent) => Promise<ForgeEvent>;
  onQueued?: (event: ForgeEvent) => void;
  onSynced?: (event: ForgeEvent, previousId?: number) => void;
};

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
};

async function registerBackgroundSync() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registration = (await navigator.serviceWorker.ready) as SyncCapableRegistration;
    if (registration.sync?.register) {
      await registration.sync.register("velaryn-sync-forge");
    }
  } catch {
    // Browsers that do not support sync will flush on reconnect via the online event.
  }
}

export function useOfflineForge({ syncEvent, onQueued, onSynced }: UseOfflineForgeOptions) {
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");

  const refreshPendingCount = useMemo(
    () => async () => {
      setPendingCount(await countQueuedForgeEvents());
    },
    []
  );

  useEffect(() => {
    refreshPendingCount().catch(() => undefined);
  }, [refreshPendingCount]);

  const flushQueue = useMemo(
    () => async () => {
      const queued = await listQueuedForgeEvents();
      if (queued.length === 0) return;

      for (const event of queued) {
        try {
          const synced = await syncEvent({ ...event, syncStatus: "synced" });
          await removeQueuedForgeEvent(event.id);
          onSynced?.(synced, event.id);
          setLiveMessage(`${synced.title} synced successfully.`);
        } catch (error) {
          await appendForgeLogEntry({
            category: "sync",
            level: "warning",
            message: `Queued event ${event.title} failed to sync: ${error instanceof Error ? error.message : "unknown error"}`,
          });
        }
      }

      await refreshPendingCount();
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    [onSynced, queryClient, refreshPendingCount, syncEvent]
  );

  useEffect(() => {
    const handleOnline = () => {
      flushQueue().catch(() => undefined);
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "velaryn-sync-forge") {
        flushQueue().catch(() => undefined);
      }
    };

    window.addEventListener("online", handleOnline);
    navigator.serviceWorker?.addEventListener?.("message", handleServiceWorkerMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      navigator.serviceWorker?.removeEventListener?.("message", handleServiceWorkerMessage);
    };
  }, [flushQueue]);

  const mutation = useMutation({
    mutationFn: async (event: ForgeEvent) => {
      const online = typeof navigator === "undefined" ? true : navigator.onLine;
      if (!online) {
        const queuedEvent: ForgeEvent = { ...event, syncStatus: "pending" };
        await enqueueForgeEvent(queuedEvent);
        await registerBackgroundSync();
        return { status: "queued" as const, event: queuedEvent };
      }

      const syncedEvent = await syncEvent({ ...event, syncStatus: "synced" });
      return { status: "synced" as const, event: syncedEvent };
    },
    onSuccess: async (result) => {
      if (result.status === "queued") {
        onQueued?.(result.event);
        setLiveMessage(`${result.event.title} saved offline and queued for sync.`);
      } else {
        onSynced?.(result.event);
        setLiveMessage(`${result.event.title} forged successfully.`);
      }

      await refreshPendingCount();
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: async (error) => {
      await appendForgeLogEntry({
        category: "sync",
        level: "error",
        message: `Forge mutation failed: ${error instanceof Error ? error.message : "unknown error"}`,
      });
      setLiveMessage("Forge action failed. Check Forge Log for details.");
    },
  });

  return {
    queueForgeEvent: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    pendingCount,
    liveMessage,
    flushQueue,
  };
}
