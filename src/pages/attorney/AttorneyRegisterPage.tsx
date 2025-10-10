import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/design-system/components';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AttorneyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firmName: '',
    attorneyName: '',
    practiceNumber: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Registration successful');
    navigate('/attorney/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Attorney Registration</h1>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Firm Name</label>
              <input
                id="firmName"
                type="text"
                value={formData.firmName}
                onChange={(e) => setFormData(prev => ({ ...prev, firmName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Attorney Name</label>
              <input
                id="attorneyName"
                type="text"
                value={formData.attorneyName}
                onChange={(e) => setFormData(prev => ({ ...prev, attorneyName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Practice Number</label>
              <input
                id="practiceNumber"
                type="text"
                value={formData.practiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, practiceNumber: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttorneyRegisterPage;
