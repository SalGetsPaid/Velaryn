"use client";

import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type RitualButtonProps = {
  children: ReactNode;
} & Omit<ComponentProps<typeof motion.button>, "children">;

export function RitualButton({ children, className = "", ...props }: RitualButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`w-full rounded-2xl border border-amber-300/45 bg-[linear-gradient(135deg,rgba(212,175,55,0.22),rgba(212,175,55,0.08))] px-6 py-3 font-black text-black tracking-wide shadow-[0_8px_28px_rgba(212,175,55,0.25)] hover:border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
