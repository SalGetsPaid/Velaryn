export default function BlackoutCompletePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-24 flex items-center justify-center">
      <div className="max-w-xl w-full border border-zinc-800 rounded-2xl bg-zinc-950 p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Emergency Protocol</p>
        <h1 className="text-3xl font-black text-amber-300 mt-3">Blackout Complete</h1>
        <p className="text-zinc-400 mt-4">
          All active sessions were purged, and linked connection credentials were scheduled for removal.
        </p>
      </div>
    </main>
  );
}
