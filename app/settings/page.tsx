"use client";

import { useEffect, useState } from "react";
import { Globe, DollarSign, Fingerprint, ShieldAlert, Link2, Bell } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import PlaidLink from "@/components/PlaidLink";
import { useSovereign } from "@/components/SovereignProvider";
import EncryptedSyncPanel from "@/components/settings/EncryptedSyncPanel";
import ForgeLogPanel from "@/components/ForgeLogPanel";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ForgeLoader from "@/components/ForgeLoader";
import type { Currency, Locale } from "@/lib/localization";

const PLAID_ALERTS_KEY = "velaryn_alerts_enabled";
const SETTINGS_ORDER_KEY = "velaryn_settings_order";
const DEFAULT_SETTINGS_ORDER = ["regional", "security", "connections"] as const;
type SettingsSectionId = (typeof DEFAULT_SETTINGS_ORDER)[number];

export default function GlobalForgeSettings() {
  const router = useRouter();
  const { pref, setPref, profile, updateProfile } = useSovereign();
  const { theme, setTheme } = useTheme();

  const [biometrics, setBiometrics] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [shredding, setShredding] = useState(false);
  const [shredded, setShredded] = useState(false);
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
  const [plaidLoading, setPlaidLoading] = useState(true);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<SettingsSectionId[]>([...DEFAULT_SETTINGS_ORDER]);

  useEffect(() => {
    setBiometrics(localStorage.getItem("velaryn_biometric_lock") !== "false");
    setAlertsEnabled(localStorage.getItem(PLAID_ALERTS_KEY) !== "false");

    const savedOrder = localStorage.getItem(SETTINGS_ORDER_KEY);
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder) as string[];
        const isValid =
          parsed.length === DEFAULT_SETTINGS_ORDER.length &&
          DEFAULT_SETTINGS_ORDER.every((id) => parsed.includes(id));

        if (isValid) {
          setSectionOrder(parsed as SettingsSectionId[]);
        }
      } catch (error) {
        console.error("Failed to parse settings order", error);
      }
    }

    const loadPlaidToken = async () => {
      try {
        const res = await fetch("/api/plaid", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Plaid token request failed: ${res.status}`);
        }
        const json = (await res.json()) as { link_token?: string };
        setPlaidToken(json.link_token ?? null);
      } catch (error) {
        console.error("Failed to create Plaid link token", error);
        setPlaidError("Plaid connection unavailable");
      } finally {
        setPlaidLoading(false);
      }
    };

    loadPlaidToken();
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_ORDER_KEY, JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  const toggleBiometric = () => {
    const next = !biometrics;
    setBiometrics(next);
    localStorage.setItem("velaryn_biometric_lock", String(next));
    if (!next) {
      sessionStorage.setItem("velaryn_session_verified", "true");
    }
  };

  const toggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    localStorage.setItem(PLAID_ALERTS_KEY, String(next));
  };

  const toggleSimplifiedMode = () => {
    updateProfile({ useSimplifiedMode: !profile.useSimplifiedMode });
  };

  const handleDataShred = async () => {
    if (!confirm("This will permanently delete all Plaid tokens and cached data. Continue?")) {
      return;
    }

    setShredding(true);
    try {
      const res = await fetch("/api/data-shred", { method: "POST" });
      if (res.ok) {
        setShredded(true);
        localStorage.clear();
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Shred failed:", err);
    } finally {
      setShredding(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32">
      <header className="mb-12">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 text-sm mb-5">
          ← Back
        </button>
        <h1 className="brand-title text-metallic-gold text-4xl italic">Forge Settings</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] mt-2">Configure Your Sovereign Parameters</p>
      </header>

      <Reorder.Group axis="y" values={sectionOrder} onReorder={setSectionOrder} className="space-y-8">

        {sectionOrder.map((sectionId) => (
          <Reorder.Item
            key={sectionId}
            value={sectionId}
            className="space-y-4"
            whileDrag={{ scale: 1.01 }}
          >
            {sectionId === "regional" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-amber-300 uppercase tracking-[0.3em] ml-2">Regional Alignment</h3>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Drag</span>
                </div>
                <div className="gilded-card overflow-hidden">
                  <div className="p-6 flex items-center justify-between border-b border-white/5 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <Globe size={18} className="text-zinc-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold">Language Preference</p>
                        <p className="text-[10px] text-zinc-500">Determines the Forge Dialect</p>
                      </div>
                    </div>
                    <select
                      value={pref.locale}
                      onChange={(e) => setPref((prev) => ({ ...prev, locale: e.target.value as Locale }))}
                      className="bg-transparent text-amber-300 text-xs font-black outline-none cursor-pointer"
                    >
                      <option value="en-US">ENGLISH</option>
                      <option value="es-ES">ESPANOL</option>
                      <option value="fr-FR">FRANCAIS</option>
                      <option value="de-DE">DEUTSCH</option>
                    </select>
                  </div>

                  <div className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <DollarSign size={18} className="text-zinc-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold">Base Currency</p>
                        <p className="text-[10px] text-zinc-500">Primary unit used across all modules</p>
                      </div>
                    </div>
                    <select
                      value={pref.currency}
                      onChange={(e) => setPref((prev) => ({ ...prev, currency: e.target.value as Currency }))}
                      className="bg-transparent text-amber-300 text-xs font-black outline-none cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (EUR)</option>
                      <option value="GBP">GBP (GBP)</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {sectionId === "security" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-amber-300 uppercase tracking-[0.3em] ml-2">Security Shield</h3>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Drag</span>
                </div>
                <div className="gilded-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Fingerprint size={18} className="text-emerald-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Biometric Vault Gate</p>
                      <p className="text-[10px] text-zinc-500">Require FaceID / Fingerprint for secure modules</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleBiometric}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${biometrics ? "bg-emerald-500" : "bg-zinc-800"}`}
                    aria-label="Toggle biometric lock"
                  >
                    <motion.div
                      animate={{ x: biometrics ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="gilded-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Bell size={18} className="text-amber-300 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Signal Alerts</p>
                      <p className="text-[10px] text-zinc-500">Push high-priority oracle and risk alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleAlerts}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${alertsEnabled ? "bg-amber-400" : "bg-zinc-800"}`}
                    aria-label="Toggle signal alerts"
                  >
                    <motion.div
                      animate={{ x: alertsEnabled ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="gilded-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Globe size={18} className="text-sky-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Simplified Terminology</p>
                      <p className="text-[10px] text-zinc-500">Use plain-English labels with helper hints across core screens</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSimplifiedMode}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${profile.useSimplifiedMode ? "bg-sky-500" : "bg-zinc-800"}`}
                    aria-label="Toggle simplified terminology"
                  >
                    <motion.div
                      animate={{ x: profile.useSimplifiedMode ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="gilded-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Globe size={18} className="text-amber-300 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Adaptive Theme</p>
                      <p className="text-[10px] text-zinc-500">Choose light, dark, or follow system preferences</p>
                    </div>
                  </div>
                  <select
                    value={theme ?? "system"}
                    onChange={(event) => setTheme(event.target.value)}
                    className="bg-transparent text-amber-300 text-xs font-black outline-none cursor-pointer"
                    aria-label="Select theme"
                  >
                    <option value="system">SYSTEM</option>
                    <option value="dark">DARK</option>
                    <option value="light">LIGHT</option>
                    <option value="gold">GOLD</option>
                    <option value="obsidian">OBSIDIAN</option>
                    <option value="emerald">EMERALD</option>
                  </select>
                </div>

                <div className="gilded-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Globe size={18} className="text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Accent Forge Theme</p>
                      <p className="text-[10px] text-zinc-500">Select your metal palette for core interface accents</p>
                    </div>
                  </div>
                  <ThemeSwitcher />
                </div>

                <button
                  onClick={handleDataShred}
                  disabled={shredding || shredded}
                  className="w-full text-left gilded-card p-6 border-red-950/30 bg-red-950/5 disabled:opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <ShieldAlert size={18} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-500">Erase Sovereign Identity</p>
                      <p className="text-[10px] text-zinc-500">
                        {shredding
                          ? "Purging all linked data..."
                          : shredded
                          ? "All data purged. Redirecting..."
                          : "Purge all data from the Forge permanently"}
                      </p>
                    </div>
                  </div>
                </button>
              </section>
            )}

            {sectionId === "connections" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-amber-300 uppercase tracking-[0.3em] ml-2">Wealth Connections</h3>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Drag</span>
                </div>
                <div className="gilded-card p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <Link2 size={18} className="text-zinc-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold">Link Institution (Plaid)</p>
                        <p className="text-[10px] text-zinc-500">Connect banks for real-time Forge data</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-300">CONNECT</span>
                  </div>

                  {plaidLoading ? (
                    <div>
                      <ForgeLoader />
                      <p className="text-center text-xs text-zinc-500">Preparing secure connection channel...</p>
                    </div>
                  ) : plaidError ? (
                    <p className="text-xs text-red-400">{plaidError}</p>
                  ) : plaidToken ? (
                    <PlaidLink token={plaidToken} />
                  ) : (
                    <p className="text-xs text-zinc-500">Connection token unavailable right now.</p>
                  )}
                </div>

                <EncryptedSyncPanel profile={profile} />
                <ForgeLogPanel />
              </section>
            )}
          </Reorder.Item>
        ))}

      </Reorder.Group>
    </div>
  );
}
