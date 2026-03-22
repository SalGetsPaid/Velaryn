/**
 * Google Play In-App Billing Integration for Native Apps
 * 
 * This module shows how to use @capgo/capacitor-purchases for native Android/iOS
 * apps where you're required to use Google Play or Apple App Store for payments.
 * 
 * IMPORTANT: Install only for native apps:
 *   npm install @capgo/capacitor-purchases
 *   npx cap sync
 * 
 * Setup:
 *   1. Create a RevenueCat account (https://www.revenuecat.com)
 *   2. Link your Google Play and Apple App Store projects
 *   3. Create EntitlementIds: "velaryn_obsidian", "velaryn_diamond"
 *   4. Create product IDs matching your app
 */

interface PurchaseResult {
  success: boolean;
  customerId?: string;
  entitlements?: string[];
  error?: string;
}

type CapacitorPurchasesModule = {
  Purchases: {
    setup: (options: { apiKey: string; appUserID?: string }) => Promise<void>;
    getProducts: (options: { identifiers: string[] }) => Promise<{ products: unknown[] }>;
    getCustomerInfo: () => Promise<{
      customerInfo: {
        originalAppUserId?: string;
        entitlements: {
          all?: Record<string, unknown>;
          active?: Record<string, unknown>;
        };
      };
    }>;
    purchaseProduct: (options: { product: unknown }) => Promise<unknown>;
    restoreTransactions: () => Promise<{
      customerInfo: {
        originalAppUserId?: string;
        entitlements: {
          all?: Record<string, unknown>;
          active?: Record<string, unknown>;
        };
      };
    }>;
  };
};

function isNativeRuntime() {
  if (typeof window === "undefined") return false;
  const maybeCapacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(maybeCapacitor?.isNativePlatform?.());
}

async function loadCapacitorPurchases(): Promise<CapacitorPurchasesModule | null> {
  if (!isNativeRuntime()) return null;

  try {
    const importer = Function("m", "return import(m)") as (moduleName: string) => Promise<CapacitorPurchasesModule>;
    return await importer("@capgo/capacitor-purchases");
  } catch (error) {
    console.warn("Native purchases module unavailable.", error);
    return null;
  }
}

/**
 * Initialize RevenueCat with your API key
 * Call this once when the app launches
 */
export async function initializeRevenueCat(
  apiKey: string,
  userId?: string
): Promise<void> {
  try {
    const nativePurchases = await loadCapacitorPurchases();
    if (!nativePurchases) return;
    const { Purchases } = nativePurchases;

    await Purchases.setup({
      apiKey,
      appUserID: userId,
    });

    console.log("RevenueCat initialized");
  } catch (err) {
    console.error("RevenueCat init failed:", err);
  }
}

/**
 * Purchase a premium tier on the native platform
 * Automatically handles Google Play and App Store popups
 */
export async function purchasePremiumTier(
  tier: "obsidian" | "diamond"
): Promise<PurchaseResult> {
  try {
    const nativePurchases = await loadCapacitorPurchases();
    if (!nativePurchases) {
      return {
        success: false,
        error: "Native purchase module is unavailable on this platform",
      };
    }
    const { Purchases } = nativePurchases;

    const productId =
      tier === "obsidian"
        ? "velaryn_obsidian_monthly"
        : "velaryn_diamond_lifetime";

    // 1. Get available products
    const { products } = await Purchases.getProducts({
      identifiers: [productId],
    });

    if (!products || products.length === 0) {
      return {
        success: false,
        error: "Product not found in store",
      };
    }

    // 2. Get customer info before purchase
    const { customerInfo: beforePurchase } = await Purchases.getCustomerInfo();

    // 3. Trigger the native purchase sheet
    const response = await Purchases.purchaseProduct({
      product: products[0],
    });

    // 4. Get updated customer info
    const { customerInfo } = await Purchases.getCustomerInfo();

    // 5. Check if entitlement was granted
    const entitlementIds = Object.keys(customerInfo.entitlements.all || {});
    const hasAccess =
      tier === "obsidian"
        ? entitlementIds.includes("velaryn_obsidian")
        : entitlementIds.includes("velaryn_diamond");

    if (hasAccess) {
      // Log to your backend for record-keeping
      await fetch("/api/native-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          customerId: customerInfo.originalAppUserId,
          receipts: response,
        }),
      }).catch((err) => console.error("Receipt logging failed:", err));

      return {
        success: true,
        customerId: customerInfo.originalAppUserId,
        entitlements: entitlementIds,
      };
    }

    return {
      success: false,
      error: "Entitlement not granted",
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Purchase failed";
    console.error("Purchase error:", msg);
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Restore purchases (e.g., when user switches devices)
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    const nativePurchases = await loadCapacitorPurchases();
    if (!nativePurchases) {
      return {
        success: false,
        error: "Native purchase module is unavailable on this platform",
      };
    }
    const { Purchases } = nativePurchases;

    const { customerInfo } = await Purchases.restoreTransactions();

    const entitlementIds = Object.keys(customerInfo.entitlements.all || {});

    if (entitlementIds.length > 0) {
      return {
        success: true,
        customerId: customerInfo.originalAppUserId,
        entitlements: entitlementIds,
      };
    }

    return {
      success: false,
      error: "No purchases found",
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Restore failed";
    console.error("Restore error:", msg);
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Check if user has premium access
 */
export async function checkPremiumAccess(): Promise<{
  hasAccess: boolean;
  tier?: "obsidian" | "diamond";
}> {
  try {
    const nativePurchases = await loadCapacitorPurchases();
    if (!nativePurchases) {
      return { hasAccess: false };
    }
    const { Purchases } = nativePurchases;

    const { customerInfo } = await Purchases.getCustomerInfo();

    const entitlements = Object.keys(customerInfo.entitlements.active || {});

    if (entitlements.includes("velaryn_diamond")) {
      return { hasAccess: true, tier: "diamond" };
    }

    if (entitlements.includes("velaryn_obsidian")) {
      return { hasAccess: true, tier: "obsidian" };
    }

    return { hasAccess: false };
  } catch (error) {
    console.error("Check premium failed:", error);
    return { hasAccess: false };
  }
}
