/**
 * Admin Support Tickets — Section 10.5
 * View, manage, and resolve user support tickets.
 */
import React, { useState, useEffect } from 'react';
import { Ticket, Search, Clock, AlertTriangle, MessageSquare, CheckCircle, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assigned_agent_id?: string;
  internal_notes?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  user_email?: string;
}

const PRIORITY_CONFIG = {
  p1: { label: 'P1 — Critical', color: 'bg-status-error-500 text-white', sla: '1h' },
  p2: { label: 'P2 — High', color: 'bg-amber-500 text-white', sla: '4h' },
  p3: { label: 'P3 — Medium', color: 'bg-neutral-500 text-white', sla: '24h' },
  p4: { label: 'P4 — Low', color: 'bg-neutral-500 text-white', sla: '72h' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-status-error-400' },
  in_progress: { label: 'In Progress', color: 'text-amber-400' },
  waiting: { label: 'Waiting', color: 'text-neutral-400' },
  resolved: { label: 'Resolved', color: 'text-status-success-400' },
  closed: { label: 'Closed', color: 'text-neutral-500' },
};

export const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => { loadTickets(); }, [statusFilter]);

  const loadTickets = async () => {
    setLoading(true);
    let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data } = await query;
    setTickets(data ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from('support_tickets').update(updates).eq('id', id);
    if (error) toast.error('Failed to update');
    else { toast.success(`Ticket ${status}`); loadTickets(); setSelectedTicket(null); }
  };

  const claimTicket = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updates: any = {
      assigned_agent_id: user.id,
      status: 'in_progress',
      first_response_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('support_tickets').update(updates).eq('id', id);
    if (error) toast.error('Failed to claim');
    else { toast.success('Ticket claimed'); loadTickets(); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm text-neutral-400 mt-1">{tickets.length} tickets</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-800/50 p-1 rounded-lg w-fit">
        {['all', 'open', 'in_progress', 'waiting', 'resolved', 'closed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              statusFilter === s ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="text-center py-12 text-neutral-500">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">No tickets found</div>
          ) : tickets.map(ticket => (
            <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
              className={`w-full text-left p-4 bg-neutral-800/50 border rounded-xl transition-colors ${
                selectedTicket?.id === ticket.id ? 'border-amber-500' : 'border-neutral-700 hover:border-neutral-600'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[ticket.priority].color}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium ${STATUS_CONFIG[ticket.status].color}`}>
                      {STATUS_CONFIG[ticket.status].label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{ticket.description}</p>
                </div>
                <span className="text-xs text-neutral-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${PRIORITY_CONFIG[selectedTicket.priority].color}`}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
                <span className="text-xs text-neutral-500">SLA: {PRIORITY_CONFIG[selectedTicket.priority].sla}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
              <p className="text-sm text-neutral-300">{selectedTicket.description}</p>
              <div className="pt-3 border-t border-neutral-700 space-y-2">
                <p className="text-xs text-neutral-500">Created: {format(new Date(selectedTicket.created_at), 'dd MMM yyyy HH:mm')}</p>
                <p className="text-xs text-neutral-500">Status: {STATUS_CONFIG[selectedTicket.status].label}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
                {!selectedTicket.assigned_agent_id && (
                  <button onClick={() => claimTicket(selectedTicket.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                    Claim Ticket
                  </button>
                )}
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button onClick={() => updateStatus(selectedTicket.id, 'resolved')}
                    className="px-3 py-1.5 text-xs font-medium bg-status-success-600 hover:bg-status-success-700 text-white rounded-lg">
                    Resolve
                  </button>
                )}
                {selectedTicket.status === 'resolved' && (
                  <button onClick={() => updateStatus(selectedTicket.id, 'closed')}
                    className="px-3 py-1.5 text-xs font-medium bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg">
                    Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
              <Ticket className="w-8 h-8 mb-2" />
              <p className="text-sm">Select a ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage;
