/**
 * Dashboard Skeleton Loaders
 * Provides skeleton loading states for dashboard components
 */

import React from 'react';
import { Card, CardHeader, CardContent } from '../design-system/components';

export const UrgentAttentionSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
        <div className="h-6 w-32 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-200 dark:bg-metallic-gray-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ThisWeekDeadlinesSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
        <div className="h-6 w-40 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-1/2" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const FinancialSnapshotSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-200 dark:bg-metallic-gray-700 rounded-lg animate-pulse" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-32 mb-2" />
          <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-24 mb-3" />
          <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ActiveMattersSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
        <div className="h-6 w-32 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-1/2" />
              <div className="space-y-1">
                <div className="h-2 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full animate-pulse" />
                <div className="h-2 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full animate-pulse w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const PendingActionsSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
        <div className="h-6 w-32 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded-lg animate-pulse" />
              <div className="w-7 h-7 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-3/4" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const QuickStatsSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
        <div className="h-6 w-48 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded-lg animate-pulse" />
              <div className="w-12 h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-7 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-24 mb-2" />
            <div className="h-3 bg-neutral-200 dark:bg-metallic-gray-700 rounded animate-pulse w-32" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
