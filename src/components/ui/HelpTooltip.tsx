/**
 * HelpTooltip Component
 * Quick help icon with tooltip for form fields
 */

import React from 'react';
import { Tooltip } from './Tooltip';
import { cn } from '../../lib/utils';

export interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  position = 'top',
  className
}) => {
  return (
    <Tooltip
      content={content}
      position={position}
      showIcon={true}
      className={cn('inline-flex', className)}
    />
  );
};

export default HelpTooltip;
