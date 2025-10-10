import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/design-system/components';
import toast from 'react-hot-toast';

export const AttorneyProfilePage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const saveProfile = () => {
    toast.success('Profile updated');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        My Profile
      </h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Profile Information</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="+27123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Enter your address"
            />
          </div>

          <Button onClick={saveProfile} variant="primary">
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttorneyProfilePage;
