"use client";

import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export default function ForgeLoader() {
  return (
    <motion.div
      animate={{ rotate: [0, 15, -10, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
      className="flex h-24 items-center justify-center"
      aria-label="Loading"
    >
      <Hammer className="text-amber-300" size={48} />
    </motion.div>
  );
}
