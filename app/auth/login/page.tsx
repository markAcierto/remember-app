"use client";

import { useState } from "react";
import { signInWithPassword, signUpWithEmail, signOut } from "@/lib/supabase/actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result =
        mode === "signin"
          ? await signInWithPassword(email, password)
          : await signUpWithEmail(email, password);

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect() throws — that's expected on success
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 pt-10 flex flex-col items-center min-h-[80vh]">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-pink text-white flex items-center justify-center font-display text-xl mb-4 mx-auto">
            R
          </div>
          <h1 className="font-display text-2xl text-brand-black">
            {mode === "signin" ? "Welcome back" : "Join Remember"}
          </h1>
          <p className="text-sm font-sans text-black/50 mt-1">
            {mode === "signin"
              ? "Pick up where you left off."
              : "Start your path to intentional responses."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-6 rounded-full border border-black/10 p-1 bg-white">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-full text-xs font-sans font-medium transition ${
              mode === "signin"
                ? "bg-brand-pink text-white"
                : "text-black/50 active:bg-black/5"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full text-xs font-sans font-medium transition ${
              mode === "signup"
                ? "bg-brand-pink text-white"
                : "text-black/50 active:bg-black/5"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-sans font-medium text-black/60 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-pink/40 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-sans font-medium text-black/60 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-pink/40 bg-white"
            />
          </div>

          {error && (
            <p className="text-xs font-sans text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="text-xs text-black/40 font-sans mt-8 text-center">
          By continuing you agree to keep the practice honest.
        </p>
      </div>
    </main>
  );
}