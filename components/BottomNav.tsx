"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/courses", label: "Courses", icon: "📚" },
  { href: "/practice", label: "Practice", icon: "🧘" },
  { href: "/community", label: "Community", icon: "💬" },
  { href: "/profile", label: "You", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md bg-white/95 backdrop-blur border-t border-black/10 flex items-center justify-around py-2">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-sans ${
              active ? "text-brand-pink" : "text-black/50"
            }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
