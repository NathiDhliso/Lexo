import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Building2, ArrowRight, Filter } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../types';

interface ClientsPageProps {
  onNavigate?: (page: Page) => void;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  activeMatters: number;
  totalBilled: number;
  status: 'active' | 'inactive';
}

const ClientsPage: React.FC<ClientsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClients([]);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Clients</h1>
          <p className="text-neutral-600 mt-1">Manage your client relationships</p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          <Icon icon={Plus} className="w-4 h-4 mr-2" noGradient />
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Users} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">{clients.length}</h3>
            <p className="text-sm text-neutral-600">Total Clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Building2} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">
              {clients.filter(c => c.status === 'active').length}
            </h3>
            <p className="text-sm text-neutral-600">Active Clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Mail} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">0</h3>
            <p className="text-sm text-neutral-600">Pending Responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Phone} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">0</h3>
            <p className="text-sm text-neutral-600">Consultations This Week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-neutral-900">Client Directory</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Icon icon={Filter} className="w-4 h-4 mr-2" noGradient />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-mpondo-gold-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-mpondo-gold-600">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{client.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-neutral-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </span>
                        <span className="text-sm text-neutral-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">
                        {client.activeMatters} Active Matter{client.activeMatters !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {formatCurrency(client.totalBilled)} billed
                      </p>
                    </div>
                  </div>
                  <Icon icon={ArrowRight} className="w-5 h-5 text-neutral-400 ml-4" noGradient />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon icon={Users} className="w-16 h-16 mx-auto mb-4 text-neutral-300" noGradient />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No clients yet</h3>
              <p className="text-neutral-600 mb-4">
                Start building your client base by adding your first client
              </p>
              <Button variant="primary" onClick={() => {}}>
                <Icon icon={Plus} className="w-4 h-4 mr-2" noGradient />
                Add Your First Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsPage;
