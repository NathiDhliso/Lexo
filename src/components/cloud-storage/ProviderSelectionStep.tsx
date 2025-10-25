/**
 * ProviderSelectionStep Component
 * Step 1 of cloud storage setup - Select provider
 * Displays provider cards with logos, descriptions, and features
 */
import React from 'react';
import { Check } from 'lucide-react';
import { Button, Card, CardContent } from '../design-system/components';
import { CLOUD_STORAGE_PROVIDERS } from '../../config/cloud-storage-providers.config';
import type { CloudStorageProvider } from '../../types/cloud-storage.types';

interface ProviderSelectionStepProps {
  selectedProvider?: CloudStorageProvider;
  onSelectProvider: (provider: CloudStorageProvider) => void;
  onInitiateConnection: (provider: CloudStorageProvider) => void;
}

export const ProviderSelectionStep: React.FC<ProviderSelectionStepProps> = ({
  selectedProvider,
  onSelectProvider,
  onInitiateConnection
}) => {
  const availableProviders = Object.values(CLOUD_STORAGE_PROVIDERS).filter(
    (provider) => provider.isAvailable
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Choose Your Cloud Storage Provider
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Select where you want to store your legal documents
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {availableProviders.map((provider) => {
          const isSelected = selectedProvider === provider.id;
          
          return (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-judicial-blue-500 dark:border-judicial-blue-400 bg-judicial-blue-50 dark:bg-judicial-blue-950/20'
                  : 'border border-neutral-200 dark:border-metallic-gray-700 hover:border-judicial-blue-300 dark:hover:border-judicial-blue-700'
              }`}
              onClick={() => onSelectProvider(provider.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{provider.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {provider.name}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-judicial-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Features:</p>
                  <ul className="space-y-1">
                    {provider.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="w-1 h-1 rounded-full bg-judicial-blue-500"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  <span>Max file size: {provider.maxFileSize / 1000}GB</span>
                </div>

                {isSelected && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onInitiateConnection(provider.id);
                    }}
                    className="w-full"
                  >
                    Connect {provider.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {availableProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">
            No cloud storage providers are currently available.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Contact support for assistance.
          </p>
        </div>
      )}
    </div>
  );
};
