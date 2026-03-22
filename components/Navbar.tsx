"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", href: "/" },
  { icon: "📐", label: "Architect", href: "/strategist" },
  { icon: "🔮", label: "Oracle", href: "/oracle" },
  { icon: "📜", label: "Ledger", href: "/ledger" },
  { icon: "�", label: "Library", href: "/library" },
  { icon: "�🛡️", label: "Vault", href: "/settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <nav aria-label="Primary navigation" className="fixed bottom-0 left-0 right-0 h-20 glass-card border-t border-white/10 flex justify-around items-center px-2 z-50">
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

function NavItem({ icon, label, href, active }: { icon: string; label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={`flex flex-col items-center gap-1 transition-colors min-w-0 ${active ? "text-amber-300" : "text-zinc-500"}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[9px] uppercase font-black tracking-tight truncate">{label}</span>
    </Link>
  );
}
