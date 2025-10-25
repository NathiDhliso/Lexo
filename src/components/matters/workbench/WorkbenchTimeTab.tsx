/**
 * Workbench Time Tab
 * View and manage time entries for the matter
 */
import React from 'react';
import { TimeEntryList } from '../../time-entries/TimeEntryList';

interface WorkbenchTimeTabProps {
  matterId: string;
  matterTitle: string;
  defaultRate?: number;
}

export const WorkbenchTimeTab: React.FC<WorkbenchTimeTabProps> = ({
  matterId,
  matterTitle,
  defaultRate = 2500,
}) => {
  return (
    <div>
      <TimeEntryList
        matterId={matterId}
        matterTitle={matterTitle}
        defaultRate={defaultRate}
      />
    </div>
  );
};
