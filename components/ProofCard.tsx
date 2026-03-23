import { motion } from "framer-motion";

export default function ProofCard({ proof }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-[2rem] bg-white/[0.02] p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(255,215,0,0.08)] transition hover:shadow-[0_0_30px_rgba(232,197,71,0.2)]"
    >
      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Wealth Progress</p>

      <p className="mt-3 font-[Playfair_Display] text-3xl text-white">
        ${proof.total.toLocaleString()} saved
      </p>

      <p className="text-sm text-zinc-400">
        Forged this month
      </p>

      <p className="mt-3 text-sm text-emerald-300">
        +${proof.delta.toLocaleString()}
      </p>
    </motion.div>
  );
}