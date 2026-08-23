"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAILY_PROMPTS, PILLARS } from "@/lib/mock-data";

export default function PracticePage() {
  const router = useRouter();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activePillar = PILLARS.find((p) => p.slug === selectedPillar);
  const question = activePillar
    ? activePillar.checkinQuestion
    : DAILY_PROMPTS[new Date().getDate() % DAILY_PROMPTS.length];

  async function handleSubmit() {
    if (!note.trim()) return;
    setSubmitting(true);
    // Simulate API call — replace with real Supabase mutation
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="px-4 pt-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h1 className="font-display text-2xl text-brand-black mb-2">
          Logged!
        </h1>
        <p className="text-sm font-sans text-black/50 max-w-xs mb-6">
          Your check-in has been saved. Show up again tomorrow — the pattern is
          what matters.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => {
              setSubmitted(false);
              setNote("");
              setSelectedPillar(null);
            }}
            className="btn-primary"
          >
            Log another
          </button>
          <button onClick={() => router.push("/community")} className="btn-secondary">
            See the community
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-brand-black">Daily practice</h1>
        <p className="text-sm text-black/50 font-sans mt-1">
          One honest reflection. Two minutes. That&apos;s the whole ask.
        </p>
      </header>

      {/* Pillar selector */}
      <section className="mb-6">
        <h2 className="text-xs font-sans font-medium text-black/40 uppercase tracking-wide mb-3">
          Which pillar are you reflecting on?
        </h2>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((pillar) => (
            <button
              key={pillar.slug}
              onClick={() => setSelectedPillar(pillar.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition ${
                selectedPillar === pillar.slug
                  ? "bg-brand-pink text-white border-brand-pink"
                  : "bg-white text-black/60 border-black/15 active:bg-black/5"
              }`}
            >
              {pillar.letter} — {pillar.name.split(" ")[0]}
            </button>
          ))}
          <button
            onClick={() => setSelectedPillar(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition ${
              !selectedPillar
                ? "bg-brand-pink text-white border-brand-pink"
                : "bg-white text-black/60 border-black/15 active:bg-black/5"
            }`}
          >
            General
          </button>
        </div>
      </section>

      {/* Question */}
      <section className="mb-6">
        <div className="card border-l-4 border-l-brand-pink bg-brand-pink/5">
          <p className="font-display text-base text-brand-black italic leading-relaxed">
            {question}
          </p>
        </div>
      </section>

      {/* Response */}
      <section className="mb-6">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your honest reflection here…"
          rows={5}
          className="w-full rounded-2xl border border-black/15 p-4 text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-brand-pink/40 bg-white"
        />
        <p className="text-xs text-black/30 font-sans mt-2 text-right">
          {note.length} characters
        </p>
      </section>

      <button
        onClick={handleSubmit}
        disabled={!note.trim() || submitting}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Saving…" : "Log this check-in"}
      </button>

      <p className="text-xs text-black/40 font-sans mt-6 text-center">
        Streak: 4 days in a row. Keep it going. 🔥
      </p>
    </main>
  );
}