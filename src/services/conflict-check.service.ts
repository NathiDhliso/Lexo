/**
 * Conflict of Interest Check Service — Section 9.2
 *
 * Before a new brief is accepted, the system searches existing and archived
 * matters for client/party/attorney name overlaps with fuzzy matching.
 */

import { supabase } from '../lib/supabase';

export interface ConflictMatch {
  matter_id: string;
  matter_title: string;
  matter_status: string;
  matched_field: 'client_name' | 'instructing_attorney' | 'description';
  matched_value: string;
  search_term: string;
  confidence: number; // 0-1
  is_archived: boolean;
}

export interface ConflictCheckResult {
  has_conflicts: boolean;
  matches: ConflictMatch[];
  checked_at: string;
  search_terms: string[];
}

export interface ConflictCheckLogEntry {
  id?: string;
  matter_id?: string;
  advocate_id: string;
  checked_names: string[];
  result: 'clear' | 'possible_conflict' | 'confirmed_conflict';
  match_count: number;
  override_reason?: string;
  created_at?: string;
}

class ConflictCheckService {
  /**
   * Run a conflict check against all existing matters for the current advocate.
   */
  async checkConflicts(
    clientName: string,
    opposingParty?: string,
    instructingAttorney?: string,
    additionalNames?: string[]
  ): Promise<ConflictCheckResult> {
    const searchTerms = [clientName];
    if (opposingParty) searchTerms.push(opposingParty);
    if (instructingAttorney) searchTerms.push(instructingAttorney);
    if (additionalNames) searchTerms.push(...additionalNames);

    // Filter out empty strings
    const cleanTerms = searchTerms.filter(t => t.trim().length > 0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch all matters for this advocate (including archived)
    const { data: matters, error } = await supabase
      .from('matters')
      .select('id, title, status, client_name, instructing_attorney, description, is_archived')
      .eq('advocate_id', user.id);

    if (error) throw error;

    const allMatches: ConflictMatch[] = [];

    for (const term of cleanTerms) {
      const normalizedTerm = this.normalizeName(term);

      for (const matter of (matters ?? [])) {
        // Check client name
        if (matter.client_name) {
          const confidence = this.fuzzyMatch(normalizedTerm, this.normalizeName(matter.client_name));
          if (confidence >= 0.6) {
            allMatches.push({
              matter_id: matter.id,
              matter_title: matter.title,
              matter_status: matter.status,
              matched_field: 'client_name',
              matched_value: matter.client_name,
              search_term: term,
              confidence,
              is_archived: matter.is_archived ?? false,
            });
          }
        }

        // Check instructing attorney
        if (matter.instructing_attorney) {
          const confidence = this.fuzzyMatch(normalizedTerm, this.normalizeName(matter.instructing_attorney));
          if (confidence >= 0.6) {
            allMatches.push({
              matter_id: matter.id,
              matter_title: matter.title,
              matter_status: matter.status,
              matched_field: 'instructing_attorney',
              matched_value: matter.instructing_attorney,
              search_term: term,
              confidence,
              is_archived: matter.is_archived ?? false,
            });
          }
        }
      }
    }

    // Deduplicate by matter_id + matched_field, keeping highest confidence
    const deduplicated = this.deduplicateMatches(allMatches);

    return {
      has_conflicts: deduplicated.length > 0,
      matches: deduplicated.sort((a, b) => b.confidence - a.confidence),
      checked_at: new Date().toISOString(),
      search_terms: cleanTerms,
    };
  }

  /**
   * Log a conflict check result (immutable audit record).
   */
  async logConflictCheck(entry: ConflictCheckLogEntry): Promise<void> {
    try {
      await supabase.from('conflict_check_log').insert({
        matter_id: entry.matter_id,
        advocate_id: entry.advocate_id,
        checked_names: entry.checked_names,
        result: entry.result,
        match_count: entry.match_count,
        override_reason: entry.override_reason,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log conflict check:', error);
    }
  }

  /**
   * Get conflict check history for a matter
   */
  async getConflictHistory(matterId: string): Promise<ConflictCheckLogEntry[]> {
    const { data, error } = await supabase
      .from('conflict_check_log')
      .select('*')
      .eq('matter_id', matterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get conflict history:', error);
      return [];
    }
    return data ?? [];
  }

  // ─── Fuzzy Matching ──────────────────────────────────────────────
  /**
   * Normalized Levenshtein-based fuzzy match returning 0-1 confidence.
   * Also handles common SA company name variations.
   */
  private fuzzyMatch(a: string, b: string): number {
    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0;

    // Check if one contains the other
    if (a.includes(b) || b.includes(a)) return 0.9;

    // Levenshtein distance normalized to 0-1
    const distance = this.levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    const similarity = 1 - distance / maxLen;

    return similarity;
  }

  /**
   * Normalize a name for comparison:
   * - Lowercase
   * - Remove common suffixes (Pty, Ltd, Limited, Inc, CC, NPC)
   * - Remove punctuation
   * - Collapse whitespace
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(pty|ltd|limited|inc|incorporated|cc|npc|proprietary|t\/a|trading as)\b/gi, '')
      .replace(/[().,\-\/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Compute Levenshtein distance between two strings.
   */
  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Deduplicate matches by matter_id + matched_field, keeping highest confidence.
   */
  private deduplicateMatches(matches: ConflictMatch[]): ConflictMatch[] {
    const map = new Map<string, ConflictMatch>();
    for (const match of matches) {
      const key = `${match.matter_id}:${match.matched_field}`;
      const existing = map.get(key);
      if (!existing || match.confidence > existing.confidence) {
        map.set(key, match);
      }
    }
    return Array.from(map.values());
  }
}

export const conflictCheckService = new ConflictCheckService();
