"use client";

import { signOut } from "@/lib/supabase/actions";

export function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut()} className="btn-secondary w-full">
      Sign out
    </button>
  );
}
