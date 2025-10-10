import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const resolvedUrl = String(supabaseUrl);
const isLocalSupabase = resolvedUrl.includes('127.0.0.1') || resolvedUrl.includes('localhost');

if (isLocalSupabase) {
  console.warn('[Supabase] Local URL detected for VITE_SUPABASE_URL:', resolvedUrl);
}

console.log('[Supabase] Using URL:', resolvedUrl);

export const supabase = createClient(resolvedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      const isHttp = /^https?:\/\//i.test(url);

      if (!isHttp) {
        return fetch(input as any, init);
      }

      const finalUrl = url;

      // Merge headers from Request object (if provided) and init.headers to avoid dropping Authorization
      const req = typeof input !== 'string' && (input as any) instanceof Request ? (input as Request) : undefined;
      const mergedHeaders = new Headers();
      if (req) {
        req.headers.forEach((value, key) => mergedHeaders.set(key, value));
      }
      if (init?.headers) {
        new Headers(init.headers as any).forEach((value, key) => mergedHeaders.set(key, value));
      }

      // Add our custom headers (preserving existing ones like Authorization)
      mergedHeaders.set('x-application-name', 'lexo');
      try {
        const h = new URL(finalUrl).hostname;
        if (h.endsWith('.supabase.co')) {
          mergedHeaders.set('apikey', supabaseAnonKey);
        }
      } catch {
        // ignore hostname parsing errors
      }

      // Debug: do NOT log secrets; just indicate presence of critical headers
      const hasAuthorization = mergedHeaders.has('authorization') || mergedHeaders.has('Authorization');
      const hasApiKey = mergedHeaders.has('apikey');
      console.debug('[Supabase] Header presence', { url: finalUrl, hasAuthorization, hasApiKey });

      // Build final Request to preserve method/body/credentials where applicable
      const finalRequest = new Request(req ?? finalUrl, { ...init, headers: mergedHeaders });

      const response = await fetch(finalRequest);
      try {
        const u2 = new URL(finalUrl);
        const isSupabaseDomain = /.supabase\.co$/i.test(u2.hostname);
        const isAuthEndpoint2 = /\/auth\/v1\//.test(u2.pathname);
        if (isSupabaseDomain && isAuthEndpoint2 && !response.ok) {
          let bodyText = '';
          try { bodyText = await response.clone().text(); } catch {}
          console.warn('[Supabase auth] Request failed', { status: response.status, path: u2.pathname, message: bodyText?.slice(0, 500) });
        }
      } catch {}
      return response;
    },
    headers: { 
      'x-application-name': 'lexo',
      'apikey': supabaseAnonKey
    },
  },
});

// Add a safe wrapper to prevent unnecessary network calls to /auth/v1/user
// when there is no authenticated session available.
const originalGetUser = (supabase.auth.getUser as any).bind(supabase.auth);
(supabase.auth as any).getUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      return { data: { user: null }, error: null };
    }
    if (!session || !(session as any).access_token) {
      return { data: { user: null }, error: null };
    }
    return await originalGetUser();
  } catch {
    return { data: { user: null }, error: null };
  }
};

