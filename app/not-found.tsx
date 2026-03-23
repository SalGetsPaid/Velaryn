import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-300">404</h1>
        <p className="mt-2 text-zinc-400">Route not found — Velaryn system initializing...</p>

        <div className="mt-4 flex justify-center gap-3">
          <Link href="/" className="text-amber-200 hover:text-amber-100">Home</Link>
          <Link href="/ledger" className="text-amber-200 hover:text-amber-100">Ledger</Link>
        </div>
      </div>
    </div>
  );
}
