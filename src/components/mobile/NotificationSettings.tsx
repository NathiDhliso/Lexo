import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { pushNotificationService } from '../../services/notifications/PushNotificationService';

interface NotificationPreferences {
  newRequests: boolean;
  paymentsReceived: boolean;
  approvalsNeeded: boolean;
  reminders: boolean;
}

export const NotificationSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newRequests: true,
    paymentsReceived: true,
    approvalsNeeded: true,
    reminders: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
    loadPreferences();
  }, []);

  const checkNotificationStatus = () => {
    setIsEnabled(Notification.permission === 'granted');
  };

  const loadPreferences = () => {
    const prefs = pushNotificationService.getPreferences();
    setPreferences(prefs);
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const initialized = await pushNotificationService.initialize();
      if (!initialized) {
        alert('Push notifications are not supported on this device');
        return;
      }

      const permitted = await pushNotificationService.requestPermission();
      if (!permitted) {
        alert('Please enable notifications in your browser settings');
        return;
      }

      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        setIsEnabled(true);
        alert('Notifications enabled successfully!');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      await pushNotificationService.unsubscribe();
      setIsEnabled(false);
      alert('Notifications disabled');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      alert('Failed to disable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await pushNotificationService.updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold">Push Notifications</h3>
        </div>
        
        {isEnabled ? (
          <Button
            onClick={handleDisableNotifications}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <BellOff className="w-4 h-4 mr-2" />
            Disable
          </Button>
        ) : (
          <Button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            size="sm"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable
          </Button>
        )}
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Notification Types</h4>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New matter requests</span>
              <input
                type="checkbox"
                checked={preferences.newRequests}
                onChange={(e) => handlePreferenceChange('newRequests', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Payments received</span>
              <input
                type="checkbox"
                checked={preferences.paymentsReceived}
                onChange={(e) => handlePreferenceChange('paymentsReceived', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Approvals needed</span>
              <input
                type="checkbox"
                checked={preferences.approvalsNeeded}
                onChange={(e) => handlePreferenceChange('approvalsNeeded', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Reminders</span>
              <input
                type="checkbox"
                checked={preferences.reminders}
                onChange={(e) => handlePreferenceChange('reminders', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}

      {!isEnabled && (
        <p className="text-sm text-gray-500">
          Enable notifications to receive updates about new requests, payments, and important reminders.
        </p>
      )}
    </div>
  );
};