/**
 * Workbench Invoicing Tab
 * Convert WIP to invoice
 */
import React from 'react';
import { MatterDetailsInvoicing } from '../MatterDetailsInvoicing';
import type { Matter } from '../../../types';

interface WorkbenchInvoicingTabProps {
  matter: Matter;
  defaultRate?: number;
}

export const WorkbenchInvoicingTab: React.FC<WorkbenchInvoicingTabProps> = ({
  matter,
  defaultRate = 2500,
}) => {
  return (
    <div>
      <MatterDetailsInvoicing
        matterId={matter.id}
        matterTitle={matter.title}
        clientName={matter.client_name || 'N/A'}
        bar={matter.instructing_firm || 'N/A'}
        matterType={matter.matter_type}
        proFormaId={(matter as any).source_proforma_id}
        defaultRate={defaultRate}
      />
    </div>
  );
};
