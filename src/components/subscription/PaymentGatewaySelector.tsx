/**
 * Payment Gateway Selector Component
 */

import React from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentGateway } from '../../types/subscription.types';

interface PaymentGatewaySelectorProps {
  selectedGateway: PaymentGateway | null;
  onSelect: (gateway: PaymentGateway) => void;
}

export const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  selectedGateway,
  onSelect
}) => {
  const gateways = [
    {
      id: PaymentGateway.PAYSTACK,
      name: 'Paystack',
      description: 'Pay with card, bank transfer, or mobile money',
      logo: '💳'
    },
    {
      id: PaymentGateway.PAYFAST,
      name: 'PayFast',
      description: 'South African payment gateway',
      logo: '🇿🇦'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Payment Method
      </label>
      {gateways.map((gateway) => (
        <button
          key={gateway.id}
          onClick={() => onSelect(gateway.id)}
          className={`
            w-full rounded-lg border-2 p-4 text-left transition-all
            ${selectedGateway === gateway.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{gateway.logo}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{gateway.name}</p>
              <p className="text-sm text-gray-600">{gateway.description}</p>
            </div>
            {selectedGateway === gateway.id && (
              <CreditCard className="h-5 w-5 text-primary-500" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
