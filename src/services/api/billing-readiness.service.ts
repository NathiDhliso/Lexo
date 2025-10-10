import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type Matter = Database['public']['Tables']['matters']['Row'];

export interface ReadinessCheck {
  isReady: boolean;
  checks: {
    hasUnbilledWork: boolean;
    matterCompleted: boolean;
    hasClientInfo: boolean;
    hasEngagementAgreement: boolean;
    noOpenDisputes: boolean;
    withinEstimate: boolean;
  };
  warnings: string[];
  blockers: string[];
  unbilledAmount: number;
}

export class BillingReadinessService {
  static async checkReadiness(matterId: string): Promise<ReadinessCheck> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select(`
          *,
          time_entries (id, hours, hourly_rate, is_billed),
          expenses (id, amount, is_billed),
          invoices (id, payment_status)
        `)
        .eq('id', matterId)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found');
      }

      const unbilledTime = (matter.time_entries || [])
        .filter((te: any) => !te.is_billed)
        .reduce((sum: number, te: any) => sum + (te.hours * te.hourly_rate), 0);

      const unbilledExpenses = (matter.expenses || [])
        .filter((exp: any) => !exp.is_billed)
        .reduce((sum: number, exp: any) => sum + exp.amount, 0);

      const unbilledAmount = unbilledTime + unbilledExpenses;

      const hasOpenDisputes = (matter.invoices || [])
        .some((inv: any) => inv.payment_status === 'disputed');

      const variancePercentage = matter.estimated_total && matter.actual_total
        ? ((matter.actual_total - matter.estimated_total) / matter.estimated_total) * 100
        : 0;

      const checks = {
        hasUnbilledWork: unbilledAmount > 0,
        matterCompleted: matter.status === 'completed' || matter.status === 'settled',
        hasClientInfo: !!(matter.client_name && matter.client_email),
        hasEngagementAgreement: !!matter.engagement_agreement_id,
        noOpenDisputes: !hasOpenDisputes,
        withinEstimate: Math.abs(variancePercentage) <= 15
      };

      const warnings: string[] = [];
      const blockers: string[] = [];

      if (!checks.hasUnbilledWork) {
        blockers.push('No unbilled work to invoice');
      }

      if (!checks.matterCompleted) {
        warnings.push('Matter is not marked as completed');
      }

      if (!checks.hasClientInfo) {
        blockers.push('Missing client contact information');
      }

      if (!checks.hasEngagementAgreement) {
        warnings.push('No engagement agreement on file');
      }

      if (!checks.noOpenDisputes) {
        warnings.push('Matter has invoices with open payment disputes');
      }

      if (!checks.withinEstimate) {
        warnings.push(`Actual costs exceed estimate by ${Math.abs(variancePercentage).toFixed(1)}%`);
      }

      const isReady = blockers.length === 0;

      return {
        isReady,
        checks,
        warnings,
        blockers,
        unbilledAmount
      };
    } catch (error) {
      console.error('Error checking billing readiness:', error);
      throw error;
    }
  }

  static async markReadyToBill(matterId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const readiness = await this.checkReadiness(matterId);

      if (!readiness.isReady) {
        throw new Error(`Cannot mark as ready to bill: ${readiness.blockers.join(', ')}`);
      }

      const { error } = await supabase
        .from('matters')
        .update({
          completion_status: 'ready_to_bill',
          billing_ready_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', matterId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      if (readiness.warnings.length > 0) {
        toast.success(`Marked ready to bill (${readiness.warnings.length} warnings)`);
      } else {
        toast.success('Matter marked as ready to bill');
      }
    } catch (error) {
      console.error('Error marking ready to bill:', error);
      const message = error instanceof Error ? error.message : 'Failed to mark ready to bill';
      toast.error(message);
      throw error;
    }
  }

  static async getMattersReadyToBill(): Promise<Matter[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('completion_status', 'ready_to_bill')
        .is('deleted_at', null)
        .order('billing_ready_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching matters ready to bill:', error);
      throw error;
    }
  }

  static async getReadinessChecklist(): Promise<{
    category: string;
    items: Array<{ label: string; required: boolean; description: string }>;
  }[]> {
    return [
      {
        category: 'Work Completion',
        items: [
          {
            label: 'Matter completed or settled',
            required: false,
            description: 'Matter status should be completed or settled before final billing'
          },
          {
            label: 'All work documented',
            required: true,
            description: 'All time entries and expenses must be recorded'
          },
          {
            label: 'Unbilled work exists',
            required: true,
            description: 'There must be unbilled time or expenses to invoice'
          }
        ]
      },
      {
        category: 'Client Information',
        items: [
          {
            label: 'Client name recorded',
            required: true,
            description: 'Client name is required for invoice generation'
          },
          {
            label: 'Client email available',
            required: true,
            description: 'Email address needed to send invoice'
          },
          {
            label: 'Engagement agreement signed',
            required: false,
            description: 'Formal engagement agreement should be on file'
          }
        ]
      },
      {
        category: 'Financial Validation',
        items: [
          {
            label: 'Within estimated costs',
            required: false,
            description: 'Actual costs should be within 15% of estimate'
          },
          {
            label: 'No open payment disputes',
            required: false,
            description: 'Resolve existing disputes before generating new invoices'
          },
          {
            label: 'Previous invoices addressed',
            required: false,
            description: 'All previous invoices should be paid or in payment plan'
          }
        ]
      },
      {
        category: 'Approval Process',
        items: [
          {
            label: 'Billing notes prepared',
            required: false,
            description: 'Add notes for partner review if required'
          },
          {
            label: 'Partner approval obtained',
            required: false,
            description: 'Senior partner approval may be required for large invoices'
          }
        ]
      }
    ];
  }

  static async completeMatter(matterId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('matters')
        .update({
          status: 'completed',
          completion_status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', matterId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Matter marked as completed');
    } catch (error) {
      console.error('Error completing matter:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete matter';
      toast.error(message);
      throw error;
    }
  }

  static async getBillingPipeline(): Promise<{
    inProgress: number;
    completed: number;
    readyToBill: number;
    inReview: number;
    totalUnbilledValue: number;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: matters, error } = await supabase
        .from('matters')
        .select(`
          completion_status,
          time_entries (hours, hourly_rate, is_billed),
          expenses (amount, is_billed)
        `)
        .eq('advocate_id', user.id)
        .is('deleted_at', null);

      if (error) throw error;

      const stats = {
        inProgress: 0,
        completed: 0,
        readyToBill: 0,
        inReview: 0,
        totalUnbilledValue: 0
      };

      (matters || []).forEach((matter: any) => {
        switch (matter.completion_status) {
          case 'in_progress':
            stats.inProgress++;
            break;
          case 'completed':
            stats.completed++;
            break;
          case 'ready_to_bill':
            stats.readyToBill++;
            break;
          case 'review':
            stats.inReview++;
            break;
        }

        const unbilledTime = (matter.time_entries || [])
          .filter((te: any) => !te.is_billed)
          .reduce((sum: number, te: any) => sum + (te.hours * te.hourly_rate), 0);

        const unbilledExpenses = (matter.expenses || [])
          .filter((exp: any) => !exp.is_billed)
          .reduce((sum: number, exp: any) => sum + exp.amount, 0);

        stats.totalUnbilledValue += unbilledTime + unbilledExpenses;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching billing pipeline:', error);
      return {
        inProgress: 0,
        completed: 0,
        readyToBill: 0,
        inReview: 0,
        totalUnbilledValue: 0
      };
    }
  }
}

export const billingReadinessService = new BillingReadinessService();
