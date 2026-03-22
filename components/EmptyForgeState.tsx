"use client";

import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export default function EmptyForgeState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Hammer className="mx-auto mb-6 text-amber-300/40" size={64} />
        <h3 className="text-2xl font-light text-zinc-300">No strikes forged yet.</h3>
        <p className="mt-3 max-w-md text-zinc-500">The anvil awaits your first hammer blow.</p>
      </motion.div>
    </div>
  );
}
