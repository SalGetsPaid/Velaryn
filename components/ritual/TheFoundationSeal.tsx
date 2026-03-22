'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';

type TheFoundationSealProps = {
  onExecute: () => void | Promise<void>;
};

export default function TheFoundationSeal({ onExecute }: TheFoundationSealProps) {
  const playMetallicTone = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;

      const audioContext = new Ctx();
      const now = audioContext.currentTime;

      const oscillatorA = audioContext.createOscillator();
      const oscillatorB = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillatorA.type = 'triangle';
      oscillatorB.type = 'sine';
      oscillatorA.frequency.setValueAtTime(720, now);
      oscillatorB.frequency.setValueAtTime(1120, now);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(180, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      oscillatorA.connect(filter);
      oscillatorB.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillatorA.start(now);
      oscillatorB.start(now);
      oscillatorA.stop(now + 0.24);
      oscillatorB.stop(now + 0.24);

      window.setTimeout(() => {
        void audioContext.close();
      }, 300);
    } catch (error) {
      console.error('Metallic tone playback failed', error);
    }
  }, []);

  const triggerHapticPulse = useCallback(async () => {
    try {
      const w = window as typeof window & {
        Capacitor?: {
          isNativePlatform?: () => boolean;
          Plugins?: {
            Haptics?: {
              impact?: (options: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => Promise<void>;
            };
          };
        };
      };

      const isNative = Boolean(w.Capacitor?.isNativePlatform?.());
      const haptics = w.Capacitor?.Plugins?.Haptics;

      if (isNative && haptics?.impact) {
        await haptics.impact({ style: 'LIGHT' });
        window.setTimeout(() => {
          void haptics.impact?.({ style: 'MEDIUM' });
        }, 55);
        return;
      }

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 35, 16]);
      }
    } catch (error) {
      console.error('Foundation Seal haptic pulse failed', error);
    }
  }, []);

  const handleExecute = useCallback(async () => {
    playMetallicTone();
    void triggerHapticPulse();
    await Promise.resolve(onExecute());
  }, [onExecute, playMetallicTone, triggerHapticPulse]);

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-20 bg-black">
      <div className="relative">
        <div className="absolute -inset-24 bg-zinc-500/5 blur-[100px] rounded-full" />

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ y: 4, scale: 0.98 }}
          onClick={() => {
            void handleExecute();
          }}
          className="relative cursor-pointer group"
        >
          <div className="w-80 h-48 bg-[#0D0D0D] rounded-xl border border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />

            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] pointer-events-none" />

            <div className="mb-4">
              <span className="text-zinc-700 font-extralight text-6xl tracking-tighter opacity-20">V</span>
            </div>

            <span className="text-zinc-400 font-light text-[10px] tracking-[0.8em] uppercase group-hover:text-white transition-colors duration-500">
              Seal the Blueprint
            </span>
          </div>

          <div className="w-[90%] h-4 bg-zinc-900 mx-auto -mt-[2px] rounded-b-xl border-t border-zinc-800 shadow-2xl" />
        </motion.div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
          Awaiting Principal Approval
        </p>
        <p className="text-zinc-700 text-[9px] max-w-[200px] mx-auto leading-relaxed">
          Transform Capital Friction into permanent Core Asset growth.
        </p>
      </div>
    </div>
  );
}
