/**
 * Database Adapter — Environment-Aware Data Layer
 *
 * Dev  → Supabase (PostgreSQL via PostgREST)
 * Prod → Azure SQL (swap adapter, same interface)
 *
 * All services should import `db` from this module instead of
 * importing the raw Supabase client directly.
 */

import { supabase } from './supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// ─── Types ───────────────────────────────────────────────────────────
export interface QueryResult<T> {
  data: T[] | null;
  error: DbError | null;
  count?: number;
}

export interface SingleResult<T> {
  data: T | null;
  error: DbError | null;
}

export interface MutationResult<T> {
  data: T | null;
  error: DbError | null;
}

export interface DbError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export type OrderDirection = 'asc' | 'desc';

export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  count?: 'exact' | 'planned' | 'estimated';
}

// ─── Database Adapter Interface ──────────────────────────────────────
export interface DatabaseAdapter {
  /** Query multiple rows from a table */
  query<T = any>(table: string, options?: QueryOptions): QueryBuilder<T>;

  /** Insert one or more rows */
  insert<T = any>(table: string, data: Partial<T> | Partial<T>[]): Promise<MutationResult<T>>;

  /** Update rows matching filters */
  update<T = any>(table: string, data: Partial<T>): FilterableQuery<MutationResult<T>>;

  /** Delete rows matching filters */
  delete<T = any>(table: string): FilterableQuery<MutationResult<T>>;

  /** Call a database function / RPC */
  rpc<T = any>(fnName: string, params?: Record<string, any>): Promise<SingleResult<T>>;

  /** Access auth methods */
  auth: AuthMethods;

  /** Access real-time subscriptions */
  realtime: RealtimeMethods;

  /** Raw client access (escape hatch for Supabase-specific features) */
  raw: any;
}

export interface AuthMethods {
  getUser(): Promise<{ user: any | null; error: any | null }>;
  getSession(): Promise<{ session: any | null; error: any | null }>;
}

export interface RealtimeMethods {
  subscribe(table: string, callback: (payload: any) => void): () => void;
}

export interface QueryBuilder<T> {
  eq(column: string, value: any): QueryBuilder<T>;
  neq(column: string, value: any): QueryBuilder<T>;
  gt(column: string, value: any): QueryBuilder<T>;
  gte(column: string, value: any): QueryBuilder<T>;
  lt(column: string, value: any): QueryBuilder<T>;
  lte(column: string, value: any): QueryBuilder<T>;
  like(column: string, pattern: string): QueryBuilder<T>;
  ilike(column: string, pattern: string): QueryBuilder<T>;
  in(column: string, values: any[]): QueryBuilder<T>;
  is(column: string, value: null | boolean): QueryBuilder<T>;
  or(filters: string): QueryBuilder<T>;
  contains(column: string, value: any): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  range(from: number, to: number): QueryBuilder<T>;
  select(columns?: string): QueryBuilder<T>;
  single(): Promise<SingleResult<T>>;
  maybeSingle(): Promise<SingleResult<T>>;
  execute(): Promise<QueryResult<T>>;
}

export interface FilterableQuery<R> {
  eq(column: string, value: any): FilterableQuery<R>;
  neq(column: string, value: any): FilterableQuery<R>;
  in(column: string, values: any[]): FilterableQuery<R>;
  is(column: string, value: null | boolean): FilterableQuery<R>;
  select(columns?: string): FilterableQuery<R>;
  single(): Promise<R>;
  execute(): Promise<R>;
}

// ─── Supabase Adapter Implementation ─────────────────────────────────
class SupabaseQueryBuilder<T> implements QueryBuilder<T> {
  private builder: any;

  constructor(builder: any) {
    this.builder = builder;
  }

  eq(column: string, value: any) { this.builder = this.builder.eq(column, value); return this; }
  neq(column: string, value: any) { this.builder = this.builder.neq(column, value); return this; }
  gt(column: string, value: any) { this.builder = this.builder.gt(column, value); return this; }
  gte(column: string, value: any) { this.builder = this.builder.gte(column, value); return this; }
  lt(column: string, value: any) { this.builder = this.builder.lt(column, value); return this; }
  lte(column: string, value: any) { this.builder = this.builder.lte(column, value); return this; }
  like(column: string, pattern: string) { this.builder = this.builder.like(column, pattern); return this; }
  ilike(column: string, pattern: string) { this.builder = this.builder.ilike(column, pattern); return this; }
  in(column: string, values: any[]) { this.builder = this.builder.in(column, values); return this; }
  is(column: string, value: null | boolean) { this.builder = this.builder.is(column, value); return this; }
  or(filters: string) { this.builder = this.builder.or(filters); return this; }
  contains(column: string, value: any) { this.builder = this.builder.contains(column, value); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.builder = this.builder.order(column, options); return this; }
  limit(count: number) { this.builder = this.builder.limit(count); return this; }
  range(from: number, to: number) { this.builder = this.builder.range(from, to); return this; }
  select(columns?: string) { this.builder = this.builder.select(columns); return this; }

  async single(): Promise<SingleResult<T>> {
    const { data, error } = await this.builder.single();
    return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null };
  }

  async maybeSingle(): Promise<SingleResult<T>> {
    const { data, error } = await this.builder.maybeSingle();
    return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null };
  }

  async execute(): Promise<QueryResult<T>> {
    const { data, error, count } = await this.builder;
    return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null, count: count ?? undefined };
  }
}

class SupabaseFilterableQuery<T> implements FilterableQuery<MutationResult<T>> {
  private builder: any;

  constructor(builder: any) {
    this.builder = builder;
  }

  eq(column: string, value: any) { this.builder = this.builder.eq(column, value); return this; }
  neq(column: string, value: any) { this.builder = this.builder.neq(column, value); return this; }
  in(column: string, values: any[]) { this.builder = this.builder.in(column, values); return this; }
  is(column: string, value: null | boolean) { this.builder = this.builder.is(column, value); return this; }
  select(columns?: string) { this.builder = this.builder.select(columns); return this; }

  async single(): Promise<MutationResult<T>> {
    const { data, error } = await this.builder.single();
    return { data, error: error ? { message: error.message, code: error.code } : null };
  }

  async execute(): Promise<MutationResult<T>> {
    const { data, error } = await this.builder;
    return { data, error: error ? { message: error.message, code: error.code } : null };
  }
}

class SupabaseAdapter implements DatabaseAdapter {
  query<T = any>(table: string, options?: QueryOptions): QueryBuilder<T> {
    let builder = supabase.from(table).select(options?.select ?? '*', options?.count ? { count: options.count } : undefined);
    if (options?.orderBy) builder = builder.order(options.orderBy, { ascending: options.orderDirection !== 'desc' });
    if (options?.limit) builder = builder.limit(options.limit);
    if (options?.offset) builder = builder.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    return new SupabaseQueryBuilder<T>(builder);
  }

  async insert<T = any>(table: string, data: Partial<T> | Partial<T>[]): Promise<MutationResult<T>> {
    const { data: result, error } = await supabase.from(table).insert(data as any).select().single();
    return { data: result as T, error: error ? { message: error.message, code: error.code } : null };
  }

  update<T = any>(table: string, data: Partial<T>): FilterableQuery<MutationResult<T>> {
    const builder = supabase.from(table).update(data as any).select();
    return new SupabaseFilterableQuery<T>(builder);
  }

  delete<T = any>(table: string): FilterableQuery<MutationResult<T>> {
    const builder = supabase.from(table).delete();
    return new SupabaseFilterableQuery<T>(builder);
  }

  async rpc<T = any>(fnName: string, params?: Record<string, any>): Promise<SingleResult<T>> {
    const { data, error } = await supabase.rpc(fnName, params);
    return { data: data as T, error: error ? { message: error.message, code: error.code } : null };
  }

  auth: AuthMethods = {
    async getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    },
    async getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    },
  };

  realtime: RealtimeMethods = {
    subscribe(table: string, callback: (payload: any) => void) {
      const channel = supabase
        .channel(`db-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
  };

  get raw() {
    return supabase;
  }
}

// ─── Singleton Export ────────────────────────────────────────────────
const provider = import.meta.env.VITE_DB_PROVIDER ?? 'supabase';

function createAdapter(): DatabaseAdapter {
  switch (provider) {
    case 'supabase':
      return new SupabaseAdapter();
    case 'azure':
      // Azure adapter will be implemented during Azure migration sprint
      console.warn('Azure adapter not yet implemented — falling back to Supabase');
      return new SupabaseAdapter();
    default:
      return new SupabaseAdapter();
  }
}

/** The primary database adapter — use this in all services */
export const db: DatabaseAdapter = createAdapter();

/** Re-export raw supabase for backward compatibility during migration */
export { supabase } from './supabase';
