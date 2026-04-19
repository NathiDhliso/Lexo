/**
 * Communication Log Service — Section 9.7
 * Immutable per-matter communication history.
 */
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type CommType = 'whatsapp' | 'email' | 'phone_call' | 'meeting' | 'letter' | 'other';
export type CommDirection = 'inbound' | 'outbound';

export interface CommunicationEntry {
  id: string;
  matter_id: string;
  advocate_id: string;
  comm_type: CommType;
  direction: CommDirection;
  participants: string[];
  subject?: string;
  summary: string;
  is_shared: boolean;
  attachments: { filename: string; url: string }[];
  created_at: string;
  version: number;
}

class CommunicationLogService {
  async getByMatter(matterId: string): Promise<CommunicationEntry[]> {
    const { data, error } = await supabase
      .from('communication_log').select('*')
      .eq('matter_id', matterId).order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data ?? [];
  }

  async create(entry: Omit<CommunicationEntry, 'id' | 'created_at' | 'version'>): Promise<CommunicationEntry | null> {
    const { data, error } = await supabase
      .from('communication_log')
      .insert({ ...entry, version: 1 }).select().single();
    if (error) { toast.error('Failed to log communication'); return null; }
    toast.success('Communication logged');
    return data;
  }

  async toggleShared(id: string, isShared: boolean): Promise<void> {
    const { error } = await supabase.from('communication_log')
      .update({ is_shared: isShared }).eq('id', id);
    if (!error) toast.success(isShared ? 'Shared with attorney' : 'Unshared');
  }

  getTypeLabel(type: CommType): string {
    const labels: Record<CommType, string> = {
      whatsapp: 'WhatsApp', email: 'Email', phone_call: 'Phone Call',
      meeting: 'Meeting', letter: 'Letter', other: 'Other',
    };
    return labels[type] ?? type;
  }
}

export const communicationLogService = new CommunicationLogService();
