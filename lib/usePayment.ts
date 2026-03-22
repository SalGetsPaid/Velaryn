import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * usePayment hook - handles both web (Stripe) and native (RevenueCat) purchases
 * Automatically detects platform and routes to the correct payment method
 */
export function usePayment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPlatformNative = () => {
    // Check if running in a native app context (Capacitor)
    if (typeof window === "undefined") return false;
    const maybeCapacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return Boolean(maybeCapacitor?.isNativePlatform?.());
  };

  const upgradeToTier = async (tier: "obsidian" | "diamond") => {
    setLoading(true);
    setError(null);

    try {
      if (isPlatformNative()) {
        // Native app: use RevenueCat
        const { purchasePremiumTier } = await import("@/lib/nativePurchases");
        const result = await purchasePremiumTier(tier);

        if (result.success) {
          // Show success message and redirect
          window.location.href = "/success?purchase=native";
        } else {
          throw new Error(result.error || "Native purchase failed");
        }
      } else {
        // Web: use Stripe
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        });

        if (!res.ok) throw new Error("Checkout creation failed");

        const { id: sessionId } = await res.json();

        // Redirect to Stripe Checkout via URL
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      console.error("Payment error:", msg);
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!isPlatformNative()) {
      setError("Restore is only available on native apps");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { restorePurchases: restore } = await import(
        "@/lib/nativePurchases"
      );
      const result = await restore();

      if (result.success) {
        window.location.href = "/success?restore=true";
      } else {
        throw new Error(result.error || "Restore failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Restore failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    upgradeToTier,
    restorePurchases,
    isPlatformNative: isPlatformNative(),
  };
}
