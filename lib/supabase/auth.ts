import { createClient } from "./server";

export type AuthUser = {
  id: string;
  email: string;
};

/**
 * Returns the authenticated user from the server session, or null.
 * Never throws: missing Supabase env vars or a failed auth call simply
 * result in null (the caller decides how to respond — typically redirect
 * to the login page).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "" };
  } catch {
    return null;
  }
}
