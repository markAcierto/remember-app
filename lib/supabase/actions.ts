/**
 * Auth Server Actions. These run on the server so the anon key and cookie
 * handling never leak to the browser.
 */
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  redirect("/");
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();

  // Build the redirect URL from the request headers so it works server-side
  const { headers } = await import("next/headers");
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return { error: error.message };
  }
  // Supabase may require email confirmation. If a session was created
  // immediately (e.g. email confirmation disabled), redirect home.
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    redirect("/");
  }
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
