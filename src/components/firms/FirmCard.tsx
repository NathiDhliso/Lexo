import React from 'react';
import { Building2, Users, Briefcase, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../design-system/components';
import { Button } from '../ui/Button';
import { AttorneyAvatar } from './AttorneyAvatar';
import { FirmActionsMenu } from './FirmActionsMenu';
import type { Firm } from '../../types/financial.types';

interface Attorney {
  id: string;
  initials: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface FirmCardProps {
  firm: Firm;
  attorneys?: Attorney[];
  activeMattersCount?: number;
  onAddAttorney: (firm: Firm) => void;
  onManageFirm: (firm: Firm) => void;
  onViewMatters: (firm: Firm) => void;
  onClick?: (firm: Firm) => void;
  className?: string;
}

export const FirmCard: React.FC<FirmCardProps> = ({
  firm,
  attorneys = [],
  activeMattersCount = 0,
  onAddAttorney,
  onManageFirm,
  onViewMatters,
  onClick,
  className = '',
}) => {
  const establishedYear = firm.created_at ? new Date(firm.created_at).getFullYear() : null;
  const displayedAttorneys = attorneys.slice(0, 4);
  const remainingCount = Math.max(0, attorneys.length - 4);

  const handleCardClick = () => {
    if (onClick) {
      onClick(firm);
    }
  };

  return (
    <Card
      className={`
        transition-all duration-200
        hover:shadow-lg
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Firm Icon */}
            <div className="p-2 bg-firm-primary-100 dark:bg-firm-primary-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-firm-primary-600 dark:text-firm-primary-400" />
            </div>

            {/* Firm Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 truncate">
                {firm.firm_name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{attorneys.length} {attorneys.length === 1 ? 'Attorney' : 'Attorneys'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{activeMattersCount} Active {activeMattersCount === 1 ? 'Matter' : 'Matters'}</span>
                </div>
                {establishedYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Est. {establishedYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <FirmActionsMenu
            onManageFirm={() => onManageFirm(firm)}
            onViewMatters={() => onViewMatters(firm)}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Attorney Roster */}
        {attorneys.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              Attorney Roster
            </h4>
            <div className="flex items-center gap-2">
              {displayedAttorneys.map((attorney) => (
                <AttorneyAvatar
                  key={attorney.id}
                  initials={attorney.initials}
                  name={attorney.name}
                  role={attorney.role}
                  isActive={attorney.isActive}
                  size="md"
                />
              ))}
              {remainingCount > 0 && (
                <div
                  className="
                    w-12 h-12 rounded-full
                    bg-neutral-100 dark:bg-metallic-gray-800
                    text-neutral-600 dark:text-neutral-400
                    flex items-center justify-center
                    font-semibold text-sm
                    border-2 border-neutral-200 dark:border-metallic-gray-700
                  "
                  title={`${remainingCount} more ${remainingCount === 1 ? 'attorney' : 'attorneys'}`}
                >
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State for No Attorneys */}
        {attorneys.length === 0 && (
          <div className="py-4 text-center">
            <Users className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No attorneys yet
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 dark:border-metallic-gray-700">
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddAttorney(firm);
            }}
            className="flex-1 min-w-[120px]"
          >
            Add Attorney
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onManageFirm(firm);
            }}
            className="flex-1 min-w-[120px]"
          >
            Manage Firm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewMatters(firm);
            }}
            className="flex-1 min-w-[120px]"
          >
            View Matters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
