/**
 * Auth Server Actions. These run on the server so the anon key and cookie
 * handling never leak to the browser.
 */
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your-project") || key.includes("your-anon")) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }); } catch { /* ignore */ }
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: "", ...options }); } catch { /* ignore */ }
      },
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    redirect("/");
  } catch (e: any) {
    return { error: e.message ?? "Sign in failed" };
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const supabase = getSupabase();
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: error.message };
    }
    if (data.session) {
      redirect("/");
    }
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Sign up failed" };
  }
}

export async function signOut() {
  try {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    redirect("/auth/login");
  } catch (e: any) {
    return { error: e.message ?? "Sign out failed" };
  }
}
