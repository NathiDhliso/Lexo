import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WorkflowCounts {
  matterCount: number;
  proFormaCount: number;
  invoiceCount: number;
  unpaidCount: number;
  loading: boolean;
}

export const useWorkflowCounts = (): WorkflowCounts => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<WorkflowCounts>({
    matterCount: 0,
    proFormaCount: 0,
    invoiceCount: 0,
    unpaidCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) {
        setCounts({
          matterCount: 0,
          proFormaCount: 0,
          invoiceCount: 0,
          unpaidCount: 0,
          loading: false
        });
        return;
      }

      try {
        const [mattersResult, proFormasResult, invoicesResult, unpaidResult] = await Promise.all([
          supabase
            .from('matters')
            .select('id', { count: 'exact', head: true })
            .eq('advocate_id', user.id)
            .eq('status', 'active'),
          
          supabase
            .from('pro_forma_requests')
            .select('id', { count: 'exact', head: true })
            .eq('advocate_id', user.id)
            .in('status', ['pending', 'submitted']),
          
          supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('advocate_id', user.id)
            .eq('status', 'draft'),
          
          supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('advocate_id', user.id)
            .in('status', ['sent', 'overdue'])
        ]);

        setCounts({
          matterCount: mattersResult.count || 0,
          proFormaCount: proFormasResult.count || 0,
          invoiceCount: invoicesResult.count || 0,
          unpaidCount: unpaidResult.count || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching workflow counts:', error);
        setCounts({
          matterCount: 0,
          proFormaCount: 0,
          invoiceCount: 0,
          unpaidCount: 0,
          loading: false
        });
      }
    };

    fetchCounts();

    const interval = setInterval(fetchCounts, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return counts;
};
