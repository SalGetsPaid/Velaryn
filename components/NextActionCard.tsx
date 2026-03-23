import { motion } from "framer-motion";

export function NextActionCard({ action, command, onExecute }: any) {
  const nextAction = action ?? command;
  if (!nextAction) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="velaryn-focus-layer relative overflow-hidden rounded-[2.2rem] p-6 shadow-[0_0_60px_rgba(232,197,71,0.12)] transition"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.15),transparent_40%)]" />

      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-200">Current Command</p>

        <p className="mt-3 font-[Playfair_Display] text-3xl text-white">
          {nextAction.title || nextAction.label || "Allocate $42"}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          {nextAction.explanation || "Strengthens your long-term capital trajectory"}
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (action) {
              onExecute?.(nextAction);
              return;
            }
            onExecute?.();
          }}
          className="mt-6 w-full rounded-xl bg-amber-300 py-3 font-semibold text-black hover:shadow-[0_0_30px_rgba(232,197,71,0.2)]"
        >
          Execute Command
        </motion.button>
      </div>
    </motion.div>
  );
}

export default NextActionCard;