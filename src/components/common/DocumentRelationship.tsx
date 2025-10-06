import React from 'react';
import { ArrowRight, Briefcase, FileText, Receipt, Eye, ExternalLink } from 'lucide-react';
import { Button } from '../../design-system/components';

export interface RelatedDocument {
  id: string;
  type: 'matter' | 'proforma' | 'invoice';
  title: string;
  subtitle?: string;
  status?: string;
}

interface DocumentRelationshipProps {
  documents: RelatedDocument[];
  currentDocumentId?: string;
  onDocumentClick?: (doc: RelatedDocument) => void;
  showTimeline?: boolean;
  className?: string;
}

const getDocumentIcon = (type: 'matter' | 'proforma' | 'invoice') => {
  switch (type) {
    case 'matter':
      return Briefcase;
    case 'proforma':
      return FileText;
    case 'invoice':
      return Receipt;
  }
};

const getDocumentColor = (type: 'matter' | 'proforma' | 'invoice') => {
  switch (type) {
    case 'matter':
      return 'bg-judicial-blue-100 text-judicial-blue-700 border-judicial-blue-200';
    case 'proforma':
      return 'bg-mpondo-gold-100 text-mpondo-gold-700 border-mpondo-gold-200';
    case 'invoice':
      return 'bg-status-success-100 text-status-success-700 border-status-success-200';
  }
};

export const DocumentRelationship: React.FC<DocumentRelationshipProps> = ({
  documents,
  currentDocumentId,
  onDocumentClick,
  showTimeline = false,
  className = ''
}) => {
  if (documents.length === 0) return null;

  if (showTimeline) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="text-sm font-medium text-neutral-700">Document Timeline</h4>
        <div className="relative">
          {documents.map((doc, index) => {
            const Icon = getDocumentIcon(doc.type);
            const isCurrent = doc.id === currentDocumentId;
            const isLast = index === documents.length - 1;

            return (
              <div key={doc.id} className="relative flex items-start gap-3 pb-4">
                {!isLast && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-neutral-200" />
                )}
                
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${
                    isCurrent
                      ? 'bg-mpondo-gold-500 border-mpondo-gold-500 text-white'
                      : 'bg-white border-neutral-300 text-neutral-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onDocumentClick?.(doc)}
                    className={`text-left w-full p-3 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-mpondo-gold-50 border-mpondo-gold-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-600 uppercase">
                            {doc.type}
                          </span>
                          {doc.status && (
                            <span className="text-xs text-neutral-500">
                              • {doc.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-neutral-900 truncate mt-1">
                          {doc.title}
                        </p>
                        {doc.subtitle && (
                          <p className="text-xs text-neutral-600 truncate mt-0.5">
                            {doc.subtitle}
                          </p>
                        )}
                      </div>
                      {onDocumentClick && (
                        <ExternalLink className="w-4 h-4 text-neutral-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {documents.map((doc, index) => {
        const Icon = getDocumentIcon(doc.type);
        const colorClass = getDocumentColor(doc.type);
        const isCurrent = doc.id === currentDocumentId;

        return (
          <React.Fragment key={doc.id}>
            <button
              onClick={() => onDocumentClick?.(doc)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isCurrent
                  ? `${colorClass} ring-2 ring-offset-2 ring-mpondo-gold-300`
                  : `${colorClass} hover:shadow-sm`
              }`}
              disabled={!onDocumentClick}
            >
              <Icon className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs font-medium">{doc.title}</div>
                {doc.subtitle && (
                  <div className="text-xs opacity-75">{doc.subtitle}</div>
                )}
              </div>
              {onDocumentClick && !isCurrent && (
                <Eye className="w-3 h-3 opacity-50" />
              )}
            </button>

            {index < documents.length - 1 && (
              <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const DocumentRelationshipCard: React.FC<{
  title?: string;
  documents: RelatedDocument[];
  currentDocumentId?: string;
  onDocumentClick?: (doc: RelatedDocument) => void;
  onViewTimeline?: () => void;
}> = ({ title = 'Related Documents', documents, currentDocumentId, onDocumentClick, onViewTimeline }) => {
  return (
    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-neutral-700">{title}</h4>
        {onViewTimeline && (
          <Button variant="ghost" size="sm" onClick={onViewTimeline}>
            View Timeline
          </Button>
        )}
      </div>
      <DocumentRelationship
        documents={documents}
        currentDocumentId={currentDocumentId}
        onDocumentClick={onDocumentClick}
      />
    </div>
  );
};
