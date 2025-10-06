import React from 'react';
import { MoreVertical, ExternalLink } from 'lucide-react';
import { Card, CardContent, Button } from '../../design-system/components';

export type DocumentType = 'matter' | 'proforma' | 'invoice';

export interface DocumentCardProps {
  type: DocumentType;
  title: string;
  subtitle?: string;
  status: string;
  urgent?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  relatedDocuments?: React.ReactNode;
  metrics?: React.ReactNode;
  timeline?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const getDocumentTypeStyles = (type: DocumentType) => {
  switch (type) {
    case 'matter':
      return {
        borderColor: 'border-l-judicial-blue-500',
        badgeColor: 'bg-judicial-blue-100 text-judicial-blue-700',
        accentColor: 'text-judicial-blue-600'
      };
    case 'proforma':
      return {
        borderColor: 'border-l-mpondo-gold-500',
        badgeColor: 'bg-mpondo-gold-100 text-mpondo-gold-700',
        accentColor: 'text-mpondo-gold-600'
      };
    case 'invoice':
      return {
        borderColor: 'border-l-status-success-500',
        badgeColor: 'bg-status-success-100 text-status-success-700',
        accentColor: 'text-status-success-600'
      };
  }
};

const getStatusBadgeColor = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('active') || statusLower.includes('sent') || statusLower.includes('accepted')) {
    return 'bg-status-success-100 text-status-success-700 border-status-success-200';
  }
  if (statusLower.includes('pending') || statusLower.includes('draft')) {
    return 'bg-mpondo-gold-100 text-mpondo-gold-700 border-mpondo-gold-200';
  }
  if (statusLower.includes('declined') || statusLower.includes('overdue') || statusLower.includes('expired')) {
    return 'bg-status-error-100 text-status-error-700 border-status-error-200';
  }
  if (statusLower.includes('paid') || statusLower.includes('completed') || statusLower.includes('closed')) {
    return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
  
  return 'bg-neutral-100 text-neutral-600 border-neutral-200';
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  type,
  title,
  subtitle,
  status,
  urgent = false,
  children,
  actions,
  relatedDocuments,
  metrics,
  timeline,
  onClick,
  className = ''
}) => {
  const styles = getDocumentTypeStyles(type);
  const statusColor = getStatusBadgeColor(status);

  return (
    <Card
      variant="default"
      hoverable={!!onClick}
      className={`border-l-4 ${styles.borderColor} ${className}`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-medium uppercase tracking-wide ${styles.accentColor}`}>
                  {type}
                </span>
                
                {urgent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-error-100 text-status-error-700 border border-status-error-200">
                    Urgent
                  </span>
                )}
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                  {status}
                </span>
              </div>
              
              <h3 
                className={`text-lg font-semibold text-neutral-900 truncate ${onClick ? 'cursor-pointer hover:text-mpondo-gold-600' : ''}`}
                onClick={onClick}
              >
                {title}
              </h3>
              
              {subtitle && (
                <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>

          {/* Metrics */}
          {metrics && (
            <div className="pt-3 border-t border-neutral-200">
              {metrics}
            </div>
          )}

          {/* Timeline */}
          {timeline && (
            <div className="pt-3 border-t border-neutral-200">
              {timeline}
            </div>
          )}

          {/* Custom Content */}
          {children && (
            <div className="pt-3 border-t border-neutral-200">
              {children}
            </div>
          )}

          {/* Related Documents */}
          {relatedDocuments && (
            <div className="pt-3 border-t border-neutral-200">
              {relatedDocuments}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DocumentCardMetrics: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {children}
  </div>
);

export const DocumentCardMetric: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}> = ({ label, value, icon: Icon, highlight = false }) => (
  <div className="flex items-center gap-2">
    {Icon && <Icon className={`w-4 h-4 ${highlight ? 'text-mpondo-gold-600' : 'text-neutral-400'}`} />}
    <div>
      <div className="text-xs text-neutral-600">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-mpondo-gold-700' : 'text-neutral-900'}`}>
        {value}
      </div>
    </div>
  </div>
);

export const DocumentCardActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2">
    {children}
  </div>
);
