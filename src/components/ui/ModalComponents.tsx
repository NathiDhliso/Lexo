/**
 * Modal Subcomponents
 * 
 * Reusable subcomponents for building modal content.
 * Provides consistent styling and structure for modal sections.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-6 py-4',
      'border-b border-neutral-200 dark:border-metallic-gray-700',
      className
    )}
  >
    {children}
  </div>
);

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalTitle: React.FC<ModalTitleProps> = ({ children, className }) => (
  <h2
    className={cn(
      'text-xl font-semibold',
      'text-neutral-900 dark:text-neutral-100',
      className
    )}
  >
    {children}
  </h2>
);

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4', 'dark:text-neutral-200', className)}>
    {children}
  </div>
);

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      'flex items-center justify-end gap-2',
      'px-6 py-4',
      'border-t border-neutral-200 dark:border-metallic-gray-700',
      className
    )}
  >
    {children}
  </div>
);

export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalDescription: React.FC<ModalDescriptionProps> = ({
  children,
  className,
}) => (
  <p className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}>
    {children}
  </p>
);
