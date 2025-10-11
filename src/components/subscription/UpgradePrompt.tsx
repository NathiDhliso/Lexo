/**
 * Upgrade Prompt Component
 * Shows when users hit subscription limits
 */

import React from 'react';
import { ArrowUpCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
    title?: string;
    message?: string;
    feature?: string;
    onDismiss?: () => void;
    variant?: 'banner' | 'modal' | 'inline';
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    title = 'Upgrade Your Plan',
    message = 'You\'ve reached the limit of your current plan. Upgrade to continue.',
    feature,
    onDismiss,
    variant = 'inline'
}) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate('/subscription');
    };

    if (variant === 'banner') {
        return (
            <div className="relative rounded-lg border border-primary-200 bg-primary-50 p-4">
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="absolute right-2 top-2 text-primary-600 hover:text-primary-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                <div className="flex items-start gap-3">
                    <ArrowUpCircle className="h-6 w-6 flex-shrink-0 text-primary-600" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-primary-900">{title}</h3>
                        <p className="mt-1 text-sm text-primary-800">{message}</p>
                        {feature && (
                            <p className="mt-1 text-sm text-primary-700">
                                Feature: <span className="font-medium">{feature}</span>
                            </p>
                        )}
                    </div>
                    <Button onClick={handleUpgrade} size="sm" className="flex-shrink-0">
                        Upgrade Now
                    </Button>
                </div>
            </div>
        );
    }

    if (variant === 'modal') {
        return (
            <div className="rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-center">
                    <ArrowUpCircle className="h-12 w-12 text-primary-500" />
                </div>
                <h3 className="mb-2 text-center text-xl font-bold text-gray-900">{title}</h3>
                <p className="mb-6 text-center text-gray-600">{message}</p>
                {feature && (
                    <div className="mb-6 rounded-md bg-gray-50 p-3">
                        <p className="text-center text-sm text-gray-700">
                            Required for: <span className="font-medium">{feature}</span>
                        </p>
                    </div>
                )}
                <div className="flex gap-3">
                    {onDismiss && (
                        <Button variant="secondary" onClick={onDismiss} className="flex-1">
                            Maybe Later
                        </Button>
                    )}
                    <Button onClick={handleUpgrade} className="flex-1">
                        View Plans
                    </Button>
                </div>
            </div>
        );
    }

    // Inline variant
    return (
        <div className="rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 text-center">
            <ArrowUpCircle className="mx-auto mb-3 h-10 w-10 text-primary-500" />
            <h3 className="mb-2 text-lg font-semibold text-primary-900">{title}</h3>
            <p className="mb-4 text-sm text-primary-800">{message}</p>
            {feature && (
                <p className="mb-4 text-sm text-primary-700">
                    Feature: <span className="font-medium">{feature}</span>
                </p>
            )}
            <Button onClick={handleUpgrade}>Upgrade Now</Button>
        </div>
    );
};
