"use client";

import Link from "next/link";
import { Compass, Home, Library, ScrollText, Shield, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Architect", href: "/strategist" },
  { icon: Sparkles, label: "Oracle", href: "/oracle" },
  { icon: ScrollText, label: "Ledger", href: "/ledger" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Shield, label: "Vault", href: "/settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-4 left-1/2 z-50 flex w-[min(94vw,920px)] -translate-x-1/2 items-center justify-between rounded-[2rem] bg-white/[0.02] px-2 py-2 backdrop-blur-xl shadow-[0_0_60px_rgba(232,197,71,0.08)]"
    >
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={pathname === item.href}
        />
      ))}
    </nav>
  );
}

function NavItem({ icon: Icon, label, href, active }: { icon: typeof Home; label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={`flex min-w-0 flex-1 items-center justify-center rounded-[1.3rem] px-3 py-3 transition ${
        active
          ? "bg-gradient-to-br from-amber-300/12 to-transparent text-amber-200 shadow-[0_0_30px_rgba(232,197,71,0.16)]"
          : "text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300"
      }`}
    >
      <span className="flex flex-col items-center gap-1">
        <Icon size={18} strokeWidth={1.8} />
        <span className="truncate text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </span>
    </Link>
  );
}
