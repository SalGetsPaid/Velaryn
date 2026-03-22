"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SealResult = {
  acceptedAt: string;
  receiptId: string;
  signature: string;
};

type ManifestoFoundryProps = {
  principalLabel?: string;
  targetBalance: number;
  onSealed: (result: SealResult) => void;
};

type BiometricResult = {
  verified: boolean;
  method: "native-biometric" | "unavailable";
  reason?: string;
};

function SlowPulseAnvil() {
  return (
    <motion.div
      animate={{ scale: [1, 1.04, 1], opacity: [0.86, 1, 0.86] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      className="mx-auto mb-6 h-24 w-24 rounded-full border border-amber-300/35 bg-black/35 p-4 shadow-[0_0_36px_rgba(212,175,55,0.28)]"
      aria-hidden="true"
    >
      <div
        className="h-full w-full bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/anvil-upgrade.svg')" }}
      />
    </motion.div>
  );
}

function playFoundryChime() {
  try {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    const context = new Ctx();
    const now = context.currentTime;

    const base = context.createOscillator();
    const harmonic = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    base.type = "sine";
    harmonic.type = "triangle";
    base.frequency.setValueAtTime(146.83, now); // D3
    harmonic.frequency.setValueAtTime(293.66, now); // D4

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    base.connect(filter);
    harmonic.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    base.start(now);
    harmonic.start(now);
    base.stop(now + 2.9);
    harmonic.stop(now + 2.9);

    window.setTimeout(() => {
      void context.close();
    }, 3200);
  } catch (error) {
    console.error("Failed to play foundry chime", error);
  }
}

export function ManifestoFoundry({ principalLabel = "Principal", targetBalance, onSealed }: ManifestoFoundryProps) {
  const [isSealing, setIsSealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"manifesto" | "online">("manifesto");
  const [tickerValue, setTickerValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  const formattedTickerValue = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(tickerValue);
  }, [tickerValue]);

  const verifyBiometric = useCallback(async (): Promise<BiometricResult> => {
    try {
      const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      const isNative = Boolean(capacitor?.isNativePlatform?.());

      if (!isNative) {
        return {
          verified: false,
          method: "unavailable",
          reason: "Biometric sealing is only available inside the native app.",
        };
      }

      const { NativeBiometric } = await import("capacitor-native-biometric");
      const availability = await NativeBiometric.isAvailable({ useFallback: true });

      if (!availability.isAvailable) {
        return {
          verified: false,
          method: "unavailable",
          reason: "No biometric capability available on this device.",
        };
      }

      await NativeBiometric.verifyIdentity({
        reason: "Seal the Velaryn Manifesto",
        title: "Biometric Seal Required",
        subtitle: "FaceID / Fingerprint required",
        description: "Confirm Principal intent before Foundry activation.",
        maxAttempts: 2,
        useFallback: true,
      });

      return { verified: true, method: "native-biometric" };
    } catch (biometricError) {
      console.error("Manifesto biometric verification failed", biometricError);
      return {
        verified: false,
        method: "unavailable",
        reason: "Biometric verification failed. Please retry.",
      };
    }
  }, []);

  const animateTicker = useCallback((toValue: number) => {
    const start = performance.now();
    const duration = 2400;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setTickerValue(toValue * eased);

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(tick);
      }
    };

    animationRef.current = window.requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const sealManifesto = useCallback(async () => {
    if (isSealing) return;

    setError(null);
    setIsSealing(true);

    try {
      const biometric = await verifyBiometric();
      if (!biometric.verified) {
        throw new Error(biometric.reason ?? "Biometric seal is required");
      }

      const acceptedAt = new Date().toISOString();
      const profileRaw = localStorage.getItem("velaryn_sovereign_profile");
      const profile = profileRaw ? (JSON.parse(profileRaw) as { userId?: string } | null) : null;
      const principalId = profile?.userId || "velaryn-user";

      const response = await fetch("/api/legal-shield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalId,
          acceptedAt,
          biometricVerified: true,
          biometricMethod: biometric.method,
          policyVersion: "manifesto-2026.03",
          termsVersion: "tos-2026.03",
          privacyVersion: "privacy-2026.03",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to store legal receipt");
      }

      localStorage.setItem("velaryn_manifesto_accepted_at", acceptedAt);
      localStorage.setItem("velaryn_manifesto_receipt_id", payload.receiptId);
      localStorage.setItem("velaryn_manifesto_receipt_signature", payload.signature);
      localStorage.setItem("velaryn_oracle_consent_at", acceptedAt);

      playFoundryChime();
      setPhase("online");
      animateTicker(Math.max(0, targetBalance));

      window.setTimeout(() => {
        onSealed({
          acceptedAt,
          receiptId: payload.receiptId,
          signature: payload.signature,
        });
      }, 3000);
    } catch (sealError) {
      const message = sealError instanceof Error ? sealError.message : "Unable to seal manifesto";
      setError(message);
    } finally {
      setIsSealing(false);
    }
  }, [animateTicker, isSealing, onSealed, targetBalance, verifyBiometric]);

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-amber-300/18 bg-[#050505] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.58)] md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.14),transparent_45%)]" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {phase === "manifesto" ? (
          <motion.div
            key="manifesto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: "blur(3px)" }}
            className="relative"
          >
            <SlowPulseAnvil />

            <h2 className="text-center font-brand text-3xl tracking-tight text-amber-200 md:text-4xl">THE VELARYN MANIFESTO</h2>
            <p className="mt-5 text-sm leading-7 text-zinc-300 md:text-base">
              {principalLabel},
              <br />
              You have exited the era of passive tracking. You are now the Architect of your own expansion. To initialize the Foundry and activate the Core Asset Ticker, you must acknowledge the Laws of the Sovereign:
            </p>

            <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-300 md:text-base">
              <p><span className="font-black tracking-wide text-amber-300">AUTONOMY:</span> Velaryn is a high-precision instrument. While our engines identify "Alpha" and "Friction," you hold the final Decree. No capital moves without your Biometric Seal.</p>
              <p><span className="font-black tracking-wide text-amber-300">FIDUCIARY INTEGRITY:</span> We provide mathematical optimization, not licensed legal or tax advice. You remain the Final Authority over your financial legacy.</p>
              <p><span className="font-black tracking-wide text-amber-300">DATA SOVEREIGNTY:</span> Your data is a private asset. By entering the Foundry, you activate Ghost Identity protocols. We sell logic and performance, never your identity.</p>
              <p><span className="font-black tracking-wide text-amber-300">THE STRIKE:</span> Every optimization is a choice. To achieve Peak Velocity, you must be decisive.</p>
            </div>

            <p className="mt-6 text-xs leading-6 text-zinc-400 md:text-sm">
              By sealing this Manifesto, you agree to our <a href="/terms" className="text-amber-300 underline">Terms of Service</a> and <a href="/privacy" className="text-amber-300 underline">Privacy Policy</a>, confirming your role as the Principal of this Command Center.
            </p>

            <button
              onClick={sealManifesto}
              disabled={isSealing}
              className="mt-8 w-full rounded-2xl border border-amber-300/45 bg-[linear-gradient(135deg,rgba(212,175,55,0.24),rgba(212,175,55,0.08))] px-6 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-black shadow-[0_14px_34px_rgba(212,175,55,0.3)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSealing ? "SEALING..." : "SEAL THE MANIFESTO"}
            </button>

            {error ? <p className="mt-4 text-center text-xs text-red-300">{error}</p> : null}
          </motion.div>
        ) : (
          <motion.div
            key="foundry-online"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-[420px] flex-col items-center justify-center text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-300/85">Foundry Initialization</p>
            <p className="mt-5 font-mono text-5xl tracking-tight text-white md:text-6xl">{formattedTickerValue}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-zinc-500">Core Asset Ticker</p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="mt-8 h-px max-w-lg bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
            />

            <p className="mt-8 text-sm text-emerald-400">Foundry Online. Scanning for Capital Friction...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}