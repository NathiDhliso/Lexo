import React from 'react';
import { Building2, Users, Briefcase, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../design-system/components';

interface FirmOverviewCardProps {
  firmName: string;
  attorneyCount: number;
  activeMatters: number;
  monthlyRevenue: number;
  onClick?: () => void;
}

export const FirmOverviewCard: React.FC<FirmOverviewCardProps> = ({
  firmName,
  attorneyCount,
  activeMatters,
  monthlyRevenue,
  onClick,
}) => {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-firm-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {firmName}
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm">
              <Users className="w-4 h-4" />
              <span>Attorneys</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {attorneyCount}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>Matters</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {activeMatters}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Revenue</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              R{monthlyRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
