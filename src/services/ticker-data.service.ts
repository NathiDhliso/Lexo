// Ticker Data Service - Live data implementation
import { matterApiService } from './api';
import { InvoiceService } from './api/invoices.service';
import { InvoiceStatus } from '../types';

export interface TickerItem {
  id: string;
  type: 'deadline' | 'invoice' | 'matter' | 'court_date' | 'client' | 'payment';
  title: string;
  description: string;
  urgency: 'urgent' | 'attention' | 'normal';
  dueDate?: Date;
  amount?: number;
  navigateTo: string;
  iconName?: string;
}

class TickerDataService {
  async getTickerItems(): Promise<TickerItem[]> {
    const items: TickerItem[] = [];
    
    try {
      // Get current user from auth context
      const userStr = localStorage.getItem('user');
      if (!userStr) return [];
      
      const user = JSON.parse(userStr);
      if (!user?.id) return [];

      // Fetch matters with upcoming deadlines
      const mattersResponse = await matterApiService.getByAdvocate(user.id, {
        pagination: { page: 1, limit: 50 }
      });

      if (!mattersResponse.error && mattersResponse.data) {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        mattersResponse.data.forEach(matter => {
          if (matter.expected_completion_date) {
            const deadline = new Date(matter.expected_completion_date);
            
            // Only show upcoming deadlines (within next 30 days)
            if (deadline >= now && deadline <= thirtyDaysFromNow) {
              const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              items.push({
                id: `matter-${matter.id}`,
                type: 'deadline',
                title: 'Matter Deadline Approaching',
                description: `${matter.title} - Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
                urgency: daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'attention' : 'normal',
                dueDate: deadline,
                navigateTo: '/matters'
              });
            }
          }
        });
      }

      // Fetch overdue and outstanding invoices
      const invoicesResponse = await InvoiceService.getInvoices({
        page: 1,
        pageSize: 50
      });

      if (invoicesResponse.data) {
        const now = new Date();
        
        invoicesResponse.data.forEach(invoice => {
          // Overdue invoices
          if (invoice.status === InvoiceStatus.OVERDUE) {
            const dueDate = invoice.dateDue ? new Date(invoice.dateDue) : null;
            const daysOverdue = dueDate 
              ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            items.push({
              id: `invoice-overdue-${invoice.id}`,
              type: 'invoice',
              title: 'Invoice Overdue',
              description: `${invoice.invoice_number} - ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
              urgency: daysOverdue > 30 ? 'urgent' : 'attention',
              amount: invoice.total_amount - (invoice.amount_paid || 0),
              navigateTo: '/invoices'
            });
          }
          
          // Invoices due soon (within 7 days)
          if (invoice.status === InvoiceStatus.SENT && invoice.dateDue) {
            const dueDate = new Date(invoice.dateDue);
            const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil >= 0 && daysUntil <= 7) {
              items.push({
                id: `invoice-due-${invoice.id}`,
                type: 'payment',
                title: 'Payment Due Soon',
                description: `${invoice.invoice_number} - Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
                urgency: daysUntil <= 2 ? 'urgent' : 'attention',
                amount: invoice.total_amount - (invoice.amount_paid || 0),
                dueDate: dueDate,
                navigateTo: '/invoices'
              });
            }
          }
        });
      }

      // Sort by urgency and date
      items.sort((a, b) => {
        const urgencyOrder = { urgent: 0, attention: 1, normal: 2 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        
        if (urgencyDiff !== 0) return urgencyDiff;
        
        // If same urgency, sort by date
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        
        return 0;
      });

      // Limit to top 10 most important items
      return items.slice(0, 10);
      
    } catch (error) {
      console.error('Error fetching ticker items:', error);
      return [];
    }
  }

  async refreshTickerData(): Promise<TickerItem[]> {
    return this.getTickerItems();
  }
}

export const tickerDataService = new TickerDataService();
