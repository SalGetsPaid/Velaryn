"use client";

import { motion } from "framer-motion";

export function AscensionNode({
  stage,
  status,
  impact,
}: {
  stage: string;
  status: string;
  impact: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="pl-6 pb-10 relative"
    >
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
      <h3 className="text-metallic-gold font-bold uppercase tracking-widest text-xs">{stage}</h3>
      <p className="text-zinc-400 text-sm mt-1">{status}</p>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="mt-4 p-4 bg-zinc-900 border border-amber-900/30 rounded-lg"
      >
        <span className="text-xs text-amber-500">PROJECTED IMPACT</span>
        <div className="text-xl font-mono text-white">+{impact}</div>
      </motion.div>
    </motion.div>
  );
}

export function PathOfSovereign({
  nodes,
}: {
  nodes: Array<{ stage: string; status: string; impact: string }>;
}) {
  return (
    <div className="relative rounded-2xl border border-amber-900/20 bg-black/20 p-6 overflow-hidden">
      <motion.div
        initial={{ height: 0, opacity: 0.4 }}
        whileInView={{ height: "100%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute left-7 top-7 w-[2px] bg-gradient-to-b from-amber-300 via-amber-500/70 to-transparent shadow-[0_0_10px_rgba(255,215,0,0.45)]"
      />

      <div className="space-y-2">
        {nodes.map((node, index) => (
          <AscensionNode
            key={`${node.stage}-${index}`}
            stage={node.stage}
            status={node.status}
            impact={node.impact}
          />
        ))}
      </div>
    </div>
  );
}
