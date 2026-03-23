"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const BIOMETRIC_LOCK_KEY = "velaryn_biometric_lock";
const BIOMETRIC_SESSION_KEY = "velaryn_session_verified";

export default function SovereignBiometricGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        const isLocalPreview =
          process.env.NODE_ENV === "development" ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        if (isLocalPreview) {
          if (mounted) {
            setIsUnlocked(true);
            setIsChecking(false);
          }
          return;
        }

        if (pathname === "/onboarding") {
          if (mounted) {
            setIsUnlocked(true);
            setIsChecking(false);
          }
          return;
        }

        const biometricEnabled = localStorage.getItem(BIOMETRIC_LOCK_KEY) !== "false";
        const alreadyVerified = sessionStorage.getItem(BIOMETRIC_SESSION_KEY) === "true";

        if (!biometricEnabled || alreadyVerified) {
          if (mounted) {
            setIsUnlocked(true);
            setIsChecking(false);
          }
          return;
        }

        const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const isNative = Boolean(capacitor?.isNativePlatform?.());

        if (!isNative) {
          sessionStorage.setItem(BIOMETRIC_SESSION_KEY, "true");
          if (mounted) {
            setIsUnlocked(true);
            setIsChecking(false);
          }
          return;
        }

        const { NativeBiometric } = await import("capacitor-native-biometric");
        const availability = await NativeBiometric.isAvailable({ useFallback: true });

        if (!availability.isAvailable) {
          if (mounted) {
            setIsUnlocked(false);
            setIsChecking(false);
          }
          return;
        }

        await NativeBiometric.verifyIdentity({
          reason: "Sovereign verification required to unlock Velaryn",
          title: "Sovereign Verification",
          subtitle: "FaceID / Fingerprint required",
          description: "Authenticate to access your command center",
          maxAttempts: 2,
          useFallback: true,
        });

        sessionStorage.setItem(BIOMETRIC_SESSION_KEY, "true");
        if (mounted) {
          setIsUnlocked(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Biometric verification failed", error);
        if (mounted) {
          setIsUnlocked(false);
          setIsChecking(false);
        }
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card max-w-md w-full p-8 rounded-[2rem] text-center">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Security Layer</p>
          <h2 className="text-2xl font-black italic mt-2">SOVEREIGN VERIFICATION</h2>
          <p className="text-sm text-zinc-400 mt-3">Validating biometric lock before loading capital data.</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card max-w-md w-full p-8 rounded-[2rem] text-center border border-red-500/30">
          <p className="text-red-400 text-[10px] uppercase tracking-widest font-black">Access Locked</p>
          <h2 className="text-2xl font-black italic mt-2">VERIFICATION REQUIRED</h2>
          <p className="text-sm text-zinc-400 mt-3">Biometric verification was declined. Reopen the app to try again.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
