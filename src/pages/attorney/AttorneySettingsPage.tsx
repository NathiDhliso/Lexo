import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/design-system/components';
import toast from 'react-hot-toast';

export const AttorneySettingsPage: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const savePreferences = () => {
    toast.success('Preferences updated');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Settings
      </h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Notification Preferences</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            Email Notifications
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="smsNotifications"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
            />
            SMS Notifications
          </label>

          <Button onClick={savePreferences} variant="primary">
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttorneySettingsPage;
