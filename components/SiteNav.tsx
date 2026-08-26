import Link from "next/link";

import BottomNav from "./BottomNav";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/practice", label: "Practice" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profile" },
];

/**
 * Server-rendered navigation: a sticky top bar on md+ screens and the
 * client-side bottom tab bar on mobile.
 */
export function SiteNav() {
  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-black/10 bg-white/90 backdrop-blur md:block">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-display text-lg text-brand-pink">
            Remember
          </Link>
          <nav className="flex items-center gap-5">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs font-medium text-black/60 transition hover:text-brand-pink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </>
  );
}
