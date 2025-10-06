import React from 'react';
import { Calendar, DollarSign, User, Clock, MoreVertical } from 'lucide-react';
import {
  DocumentCard,
  DocumentCardMetrics,
  DocumentCardMetric,
  DocumentCardActions
} from '../common/DocumentCard';
import { StatusPipeline, MATTER_PIPELINE_STEPS } from '../common/StatusPipeline';
import { DocumentRelationship, RelatedDocument } from '../common/DocumentRelationship';
import { Button } from '../../design-system/components';
import type { Matter } from '../../types';

interface EnhancedMatterCardProps {
  matter: Matter;
  relatedDocuments?: RelatedDocument[];
  onViewMatter?: () => void;
  onCreateProForma?: () => void;
  onCreateInvoice?: () => void;
  onViewDocuments?: (doc: RelatedDocument) => void;
}

export const EnhancedMatterCard: React.FC<EnhancedMatterCardProps> = ({
  matter,
  relatedDocuments = [],
  onViewMatter,
  onCreateProForma,
  onCreateInvoice,
  onViewDocuments
}) => {
  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  return (
    <DocumentCard
      type="matter"
      title={matter.title}
      subtitle={`${matter.client_name} • ${matter.matter_type}`}
      status={matter.status}
      urgent={matter.risk_level === 'high'}
      onClick={onViewMatter}
      metrics={
        <DocumentCardMetrics>
          <DocumentCardMetric
            label="Client"
            value={matter.client_name}
            icon={User}
          />
          <DocumentCardMetric
            label="Estimated Fee"
            value={formatCurrency(matter.estimated_fee || 0)}
            icon={DollarSign}
            highlight
          />
          <DocumentCardMetric
            label="Created"
            value={formatDate(matter.created_at)}
            icon={Calendar}
          />
          <DocumentCardMetric
            label="Attorney"
            value={matter.instructing_attorney || 'N/A'}
            icon={User}
          />
        </DocumentCardMetrics>
      }
      timeline={
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Matter Progress</h4>
          <StatusPipeline
            steps={MATTER_PIPELINE_STEPS}
            currentStep={matter.status}
            variant="matter"
            size="sm"
          />
        </div>
      }
      relatedDocuments={
        relatedDocuments.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Related Documents</h4>
            <DocumentRelationship
              documents={relatedDocuments}
              onDocumentClick={onViewDocuments}
            />
          </div>
        ) : undefined
      }
      actions={
        <DocumentCardActions>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCreateProForma?.();
            }}
          >
            Create Pro Forma
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCreateInvoice?.();
            }}
          >
            Create Invoice
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DocumentCardActions>
      }
    >
      {matter.description && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Description</h4>
          <p className="text-sm text-neutral-600 line-clamp-2">{matter.description}</p>
        </div>
      )}
    </DocumentCard>
  );
};
