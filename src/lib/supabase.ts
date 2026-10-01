import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Browser/Client Configuration
 *
 * SECURITY BOUNDARY RULE:
 * Browser/client code may ONLY use:
 * - SUPABASE_URL (or VITE_SUPABASE_URL)
 * - SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)
 *
 * Server-only variables (SUPABASE_SECRET_KEY, DATABASE_URL, GOOGLE_AI_API_KEY)
 * must NEVER be exposed, bundled, or referenced in client-side React code.
 */

const DEFAULT_SUPABASE_URL = 'https://sebnhkmgjxhgiyrrxtsy.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QlYmR9uQUNgv3qo2ZVSEvA_wl2QZMhH';

export const supabaseUrl: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL)) ||
  DEFAULT_SUPABASE_URL;

export const supabasePublishableKey: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY)) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export interface SupabaseClientConfig {
  url: string;
  publishableKey: string;
  isConfigured: boolean;
  status: 'CONNECTED' | 'STANDBY_PENDING_CREDENTIALS';
}

const isConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !supabasePublishableKey.includes('your-publishable-key')
);

export const supabaseConfig: SupabaseClientConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
  isConfigured,
  status: isConfigured ? 'CONNECTED' : 'STANDBY_PENDING_CREDENTIALS',
};

export const isSupabaseConfigured = (): boolean => {
  return supabaseConfig.isConfigured;
};

// Singleton Supabase Browser Client initialized with public publishable key
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Safe fetch helper for future Supabase tables.
 * Returns null or empty array if table has not yet been populated/migrated.
 */
export async function safeFetchFromSupabase<T>(
  tableName: string,
  queryBuilder?: (query: any) => any
): Promise<{ data: T[] | null; error: string | null }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not initialized' };
  }

  try {
    let query = supabase.from(tableName).select('*');
    if (queryBuilder) {
      query = queryBuilder(query);
    }
    const { data, error } = await query;
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: (data as T[]) || [], error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Unknown network or query error' };
  }
}
