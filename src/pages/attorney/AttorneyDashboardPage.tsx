import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/design-system/components';
import { Briefcase, FileText, DollarSign, Activity } from 'lucide-react';

export const AttorneyDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Attorney Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-neutral-600">Active Matters</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-neutral-600">Pending Pro Formas</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-neutral-600">Outstanding Invoices</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-status-error-500" />
              <div>
                <p className="text-sm text-neutral-600">Total Outstanding</p>
                <p className="text-2xl font-bold">R 125,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border-b last:border-b-0">
                <Activity className="w-5 h-5 text-neutral-500" />
                <div>
                  <p className="font-medium">Activity {i + 1}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(Date.now() - i * 3600000).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttorneyDashboardPage;
