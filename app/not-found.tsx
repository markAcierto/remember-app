import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-4 pt-10 flex flex-col items-center min-h-[70vh] text-center">
      <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
        <span className="text-3xl">🔍</span>
      </div>
      <h1 className="font-display text-2xl text-brand-black mb-2">
        Page not found
      </h1>
      <p className="text-sm font-sans text-black/50 mb-6 max-w-xs">
        This page doesn&apos;t exist yet. Let&apos;s get you back on the path.
      </p>
      <Link href="/" className="btn-primary">
        Back home
      </Link>
    </main>
  );
}