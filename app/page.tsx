import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Velaryn</h1>
      <p className="text-zinc-400 mt-2">AI Wealth Command System</p>

      <Link
        href="/ledger"
        className="mt-6 px-6 py-3 rounded-xl bg-amber-400 text-black font-bold"
      >
        Enter App
      </Link>
    </div>
  );
}
