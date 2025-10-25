/**
 * Workbench Expenses Tab
 * View and manage expenses/disbursements for the matter
 */
import React from 'react';
import { ExpenseList } from '../../expenses/ExpenseList';

interface WorkbenchExpensesTabProps {
  matterId: string;
}

export const WorkbenchExpensesTab: React.FC<WorkbenchExpensesTabProps> = ({
  matterId,
}) => {
  return (
    <div>
      <ExpenseList matterId={matterId} />
    </div>
  );
};
