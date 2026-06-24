// ─────────────────────────────────────────────────────────────
// Supabase client (optional).
//
// If NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are
// set, a real client is created. Otherwise the app runs fully on a
// local-storage fallback (see store.ts) so the prototype works with
// zero setup.
//
// NOTE: We import @supabase/supabase-js lazily so the package is only
// required when Supabase is actually configured.
// ─────────────────────────────────────────────────────────────

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// We keep the client type loose to avoid a hard dependency when the
// package isn't installed in a zero-config prototype run.
type AnyClient = {
  from: (table: string) => any;
  auth: any;
};

let cached: AnyClient | null = null;

/**
 * Returns a Supabase client when configured, else null.
 * Uses a dynamic import so builds succeed even if the dependency or
 * env vars are absent.
 */
export async function getSupabase(): Promise<AnyClient | null> {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  try {
    const mod = await import("@supabase/supabase-js");
    cached = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) as AnyClient;
    return cached;
  } catch {
    // Package not installed — fall back to local storage silently.
    return null;
  }
}
