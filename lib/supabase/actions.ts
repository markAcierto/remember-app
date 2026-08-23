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
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
  });
  if (error) {
    return { error: error.message };
  }
  // Supabase may require email confirmation. Redirect to a confirmation page
  // if the session wasn't created immediately.
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
