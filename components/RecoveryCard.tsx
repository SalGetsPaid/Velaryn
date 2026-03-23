import { motion } from "framer-motion";

export default function RecoveryCard({ recovery }: any) {
  if (!recovery) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-[2rem] bg-red-500/10 p-6 shadow-[0_0_40px_rgba(255,215,0,0.08)] transition hover:shadow-[0_0_30px_rgba(232,197,71,0.2)]"
    >
      <p className="text-[11px] uppercase tracking-[0.25em] text-red-300">Trajectory Correction</p>

      <p className="mt-3 text-lg text-white">
        ${recovery.deficit} below optimal path
      </p>

      <p className="text-red-300">
        Reallocate ${recovery.recoveryPerDay}/day for 3 days
      </p>
    </motion.div>
  );
}