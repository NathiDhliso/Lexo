/**
 * NewRequestCard Component
 * Display card for new matter requests with amber styling
 * Shows "NEW" badge and attorney/firm context
 */
import React from 'react';
import { Building2, User, FileText, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, Button } from '../design-system/components';
import { MatterStatusBadge } from '../ui/MatterStatusBadge';
import type { Matter } from '../../types';
import { MatterStatus } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface NewRequestCardProps {
  matter: Matter;
  onSendProForma?: (matter: Matter) => void; // Path A: Detailed work with estimate
  onAcceptBrief?: (matter: Matter) => void;  // Path B: Quick accept for brief work
  onRequestInfo?: (matter: Matter) => void;
  onDecline?: (matter: Matter) => void;
  onView?: (matter: Matter) => void;
  // Legacy support
  onAccept?: (matter: Matter) => void;
}

export const NewRequestCard: React.FC<NewRequestCardProps> = ({
  matter,
  onSendProForma,
  onAcceptBrief,
  onRequestInfo,
  onDecline,
  onView,
  onAccept // Legacy support
}) => {
  const documentCount = (matter as any).linked_documents?.length || 0;
  const submittedTime = matter.created_at 
    ? formatDistanceToNow(new Date(matter.created_at), { addSuffix: true })
    : 'Recently';

  return (
    <Card
      className="relative border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onView?.(matter)}
    >
      {/* NEW Badge */}
      <div className="absolute -top-3 -left-3 z-10">
        <Badge 
          variant="warning"
          className="bg-amber-500 text-white font-bold px-3 py-1 text-xs uppercase tracking-wide shadow-md"
        >
          🆕 New
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 line-clamp-2">
              {matter.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <MatterStatusBadge status={MatterStatus.NEW_REQUEST} showIcon={false} />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Submitted {submittedTime}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Attorney & Firm Context */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-judicial-blue-600 dark:text-judicial-blue-400" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">From:</span>
            <span className="text-neutral-900 dark:text-neutral-100">{matter.instructing_firm}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-judicial-blue-600 dark:text-judicial-blue-400" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Attorney:</span>
            <span className="text-neutral-900 dark:text-neutral-100">{matter.instructing_attorney}</span>
          </div>

          {matter.estimated_fee && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Est. Value:</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                R {matter.estimated_fee.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {matter.description && (
          <div className="bg-white dark:bg-metallic-gray-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                {matter.description}
              </p>
            </div>
          </div>
        )}

        {/* Document Count */}
        {documentCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Paperclip className="w-4 h-4" />
            <span>{documentCount} document{documentCount !== 1 ? 's' : ''} attached</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary Actions: Choose Your Path */}
          {(onSendProForma || onAcceptBrief || onAccept) && (
            <div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Choose your workflow:
              </p>
              <div className="flex gap-2">
                {/* Path A: Send Pro Forma (Detailed Work) */}
                {onSendProForma && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onSendProForma(matter);
                    }}
                    className="flex-1"
                    title="For detailed work requiring estimate approval"
                  >
                    📋 Send Pro Forma
                  </Button>
                )}
                
                {/* Path B: Accept Brief (Quick Start) */}
                {onAcceptBrief && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onAcceptBrief(matter);
                    }}
                    className="flex-1 bg-mpondo-gold-600 hover:bg-mpondo-gold-700 text-white"
                    title="For simple brief work - skip pro forma"
                  >
                    ⚡ Accept Brief
                  </Button>
                )}
                
                {/* Legacy Accept Button */}
                {onAccept && !onSendProForma && !onAcceptBrief && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onAccept(matter);
                    }}
                    className="flex-1"
                  >
                    Accept
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            {onRequestInfo && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onRequestInfo(matter);
                }}
                className="flex-1"
              >
                Request More Info
              </Button>
            )}
            
            {onDecline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDecline(matter);
                }}
                className="text-status-error-600 hover:text-status-error-700 hover:bg-status-error-50 dark:hover:bg-status-error-950"
              >
                Decline
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
