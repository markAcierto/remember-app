"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DAILY_PROMPTS, PILLARS } from "@/lib/mock-data";
import { logCheckinAction } from "@/lib/supabase/checkin-actions";
import type { RecentCheckin } from "@/lib/supabase/feed";

type PracticePanelProps = {
  recentCheckins: RecentCheckin[];
  /** null means the streak could not be determined (not signed in, etc.). */
  streak: number | null;
};

export function PracticePanel({
  recentCheckins: initialRecent,
  streak,
}: PracticePanelProps) {
  const router = useRouter();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoSaved, setDemoSaved] = useState(false);
  const [recent, setRecent] = useState(initialRecent);

  const activePillar = PILLARS.find((p) => p.slug === selectedPillar);
  const question = activePillar
    ? activePillar.checkinQuestion
    : DAILY_PROMPTS[new Date().getDate() % DAILY_PROMPTS.length];

  async function handleSubmit() {
    if (!note.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await logCheckinAction(
      selectedPillar,
      question,
      note
    );
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setDemoSaved(result.mode === "demo");
    setRecent((previous) => [
      {
        id: `local-${Date.now()}`,
        text: note.trim(),
        pillarSlug: selectedPillar,
        time: "now",
      },
      ...previous,
    ]);
    setSubmitted(true);
  }

  function reset() {
    setSubmitted(false);
    setNote("");
    setSelectedPillar(null);
    setError(null);
  }

  if (submitted) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-6 text-center pb-28">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink/10">
          <span className="font-display text-2xl text-brand-pink">✓</span>
        </div>
        <h1 className="mb-2 font-display text-2xl text-brand-black">
          Logged!
        </h1>
        <p className="mb-6 max-w-xs text-sm font-sans text-black/50">
          Your check-in has been saved. Show up again tomorrow — the pattern is
          what matters.
        </p>
        {demoSaved && (
          <p className="mb-6 max-w-xs rounded-full border border-black/10 bg-black/5 px-3 py-1 font-sans text-xs text-black/60">
            Demo save — connect Supabase to keep it and sync it to the
            community.
          </p>
        )}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button onClick={reset} className="btn-primary">
            Log another
          </button>
          <button
            onClick={() => router.push("/community")}
            className="btn-secondary"
          >
            See the community
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6 pb-28">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-brand-black">
          Daily practice
        </h1>
        <p className="mt-1 font-sans text-sm text-black/50">
          One honest reflection. Two minutes. That&apos;s the whole ask.
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-black/40">
          Which pillar are you reflecting on?
        </h2>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((pillar) => (
            <button
              key={pillar.slug}
              type="button"
              onClick={() => setSelectedPillar(pillar.slug)}
              className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                selectedPillar === pillar.slug
                  ? "border-brand-pink bg-brand-pink text-white"
                  : "border-black/15 bg-white text-black/60 active:bg-black/5"
              }`}
            >
              {pillar.letter} — {pillar.name.split(" ")[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedPillar(null)}
            className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
              !selectedPillar
                ? "border-brand-pink bg-brand-pink text-white"
                : "border-black/15 bg-white text-black/60 active:bg-black/5"
            }`}
          >
            General
          </button>
        </div>
      </section>

      <section className="mb-6">
        <div className="card border-l-4 border-l-brand-pink bg-brand-pink/5">
          <p className="font-display text-base italic leading-relaxed text-brand-black">
            {question}
          </p>
        </div>
      </section>

      <section className="mb-6">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your honest reflection here…"
          rows={5}
          className="w-full resize-none rounded-2xl border border-black/15 bg-white p-4 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/40"
        />
        <p className="mt-2 text-right font-sans text-xs text-black/30">
          {note.length} characters
        </p>
      </section>

      {error && (
        <p className="mb-4 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 font-sans text-xs text-brand-black/80">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!note.trim() || submitting}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Saving…" : "Log this check-in"}
      </button>

      {streak !== null && (
        <p className="mt-6 text-center font-sans text-xs text-black/40">
          {streak > 0
            ? `Streak: ${streak} day${streak === 1 ? "" : "s"} in a row. Keep it going.`
            : "Your streak starts with this check-in."}
        </p>
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-black/40">
            Your recent check-ins
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map((entry) => (
              <div key={entry.id} className="card">
                <p className="font-sans text-sm text-brand-black/80">
                  {entry.text}
                </p>
                <p className="mt-1 font-sans text-xs text-black/40">
                  {entry.time}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
