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
    fetch: async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      const isHttp = /^https?:\/\//i.test(url);

      if (!isHttp) {
        return fetch(input as any, init);
      }

      let finalUrl = url;
      try {
        const u = new URL(url);
        // Do not modify URL query params; rely on headers for auth
        finalUrl = url;
      } catch {
        finalUrl = url;
      }

      // Preserve original headers (including Content-Type) and add ours
      const headers = new Headers(init?.headers || {});
      headers.set('x-application-name', 'lexo');

      // Only inject the apikey header for Supabase domains
      try {
        const h = new URL(finalUrl).hostname;
        if (h.endsWith('.supabase.co')) {
          headers.set('apikey', supabaseAnonKey);
        }
      } catch {
        // ignore hostname parsing errors
      }

      const response = await fetch(finalUrl, { ...init, headers });
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

// Database types (these would be generated from Supabase CLI in production)
export interface Database {
  public: {
    Tables: {
      advocates: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          initials: string;
          practice_number: string;
          bar: 'johannesburg' | 'cape_town';
          year_admitted: number;
          specialisations: string[];
          hourly_rate: number;
          contingency_rate?: number;
          success_fee_rate?: number;
          phone_number?: string;
          chambers_address?: string;
          postal_address?: string;
          notification_preferences: Record<string, unknown>;
          invoice_settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          last_login_at?: string;
          is_active: boolean;
          deleted_at?: string;
          total_outstanding: number;
          total_collected_ytd: number;
          matters_count: number;
        };
        Insert: Omit<Database['public']['Tables']['advocates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['advocates']['Insert']>;
      };
      matters: {
        Row: {
          id: string;
          advocate_id: string;
          reference_number: string;
          title: string;
          description?: string;
          matter_type: string;
          court_case_number?: string;
          bar: 'johannesburg' | 'cape_town';
          client_name: string;
          client_email?: string;
          client_phone?: string;
          client_address?: string;
          client_type?: string;
          instructing_attorney: string;
          instructing_attorney_email?: string;
          instructing_attorney_phone?: string;
          instructing_firm?: string;
          instructing_firm_ref?: string;
          fee_type: 'standard' | 'contingency' | 'success' | 'retainer' | 'pro_bono';
          estimated_fee?: number;
          fee_cap?: number;
          actual_fee?: number;
          wip_value: number;
          trust_balance: number;
          disbursements: number;
          vat_exempt: boolean;
          status: 'active' | 'pending' | 'settled' | 'closed' | 'on_hold';
          risk_level: 'low' | 'medium' | 'high' | 'critical';
          settlement_probability?: number;
          expected_completion_date?: string;
          conflict_check_completed: boolean;
          conflict_check_date?: string;
          conflict_check_cleared?: boolean;
          conflict_notes?: string;
          date_instructed: string;
          date_accepted?: string;
          date_commenced?: string;
          date_settled?: string;
          date_closed?: string;
          next_court_date?: string;
          prescription_date?: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          deleted_at?: string;
          days_active: number;
          is_overdue: boolean;
        };
        Insert: Omit<Database['public']['Tables']['matters']['Row'], 'id' | 'created_at' | 'updated_at' | 'days_active' | 'is_overdue'>;
        Update: Partial<Database['public']['Tables']['matters']['Insert']>;
      };
      // Add other table types as needed
    };
  };
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
  
export type Inserts<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];
  
export type Updates<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Ensure our custom fetch only touches Supabase HTTP(S) URLs, and avoid printing noisy logs
const isSupabaseUrl = (url: string) => {
  try {
    const u = new URL(url, window.location.origin);
    return /\.supabase\.co$/i.test(u.hostname);
  } catch {
    return false;
  }
};

const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url);
    if (!isSupabaseUrl(url)) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init?.headers || {});
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (apiKey && !headers.has('apikey')) {
      headers.set('apikey', apiKey);
    }
    if (!headers.has('x-application-name')) {
      headers.set('x-application-name', 'LexoHub');
    }

    const modifiedInit: RequestInit = { ...init, headers };

    // Do not append apikey as query param; rely on headers only
    const u = new URL(url);
    const isAuthEndpoint = /\/auth\/v1\//.test(u.pathname);

    const resp = await originalFetch(u.toString(), modifiedInit);
    if (isAuthEndpoint && !resp.ok) {
      let bodyText = '';
      try { bodyText = await resp.clone().text(); } catch {}
      console.warn('[Supabase auth] Request failed', { status: resp.status, path: u.pathname, message: bodyText?.slice(0, 500) });
    }
    return resp;
  } catch (err) {
    // Fail open so non-supabase or unexpected inputs still work
    return originalFetch(input, init);
  }
};