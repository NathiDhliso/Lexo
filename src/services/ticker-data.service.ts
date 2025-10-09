// Ticker Data Service - Placeholder implementation
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
    // Placeholder implementation
    return [
      {
        id: '1',
        type: 'deadline',
        title: 'Matter Deadline Approaching',
        description: 'Smith vs. Jones - Discovery due in 2 days',
        urgency: 'urgent',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        navigateTo: '/matters/1'
      },
      {
        id: '2',
        type: 'invoice',
        title: 'Invoice Overdue',
        description: 'Invoice #INV-2024-001 - 30 days overdue',
        urgency: 'attention',
        amount: 5000,
        navigateTo: '/invoices/1'
      }
    ];
  }

  async refreshTickerData(): Promise<TickerItem[]> {
    return this.getTickerItems();
  }
}

export const tickerDataService = new TickerDataService();
