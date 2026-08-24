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

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return { error: error.message };
  }
  // If a session was created (email confirmation disabled in Supabase),
  // redirect home. Otherwise the user needs to confirm via email.
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
