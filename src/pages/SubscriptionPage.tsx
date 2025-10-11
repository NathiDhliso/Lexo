/**
 * Subscription Page
 */

import React from 'react';
import { SubscriptionManagement } from '../components/subscription/SubscriptionManagement';

export const SubscriptionPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your LexoHub subscription and billing
        </p>
      </div>

      <SubscriptionManagement />
    </div>
  );
};
