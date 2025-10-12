import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/design-system/components';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { attorneyService } from '../../services/api/attorney.service';

export const AttorneyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firmName: '',
    attorneyName: '',
    practiceNumber: '',
    phoneNumber: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await attorneyService.registerAttorney({
        email: formData.email,
        password: formData.password,
        firm_name: formData.firmName,
        attorney_name: formData.attorneyName,
        practice_number: formData.practiceNumber,
        phone_number: formData.phoneNumber
      });

      if (result) {
        toast.success('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/attorney/login');
        }, 2000);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Client Portal Registration</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2">
            Register to access your matters, invoices, and documents
          </p>
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
              <label className="block text-sm font-medium mb-1">Practice Number (Optional)</label>
              <input
                id="practiceNumber"
                type="text"
                value={formData.practiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, practiceNumber: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+27 12 345 6789"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-neutral-600">Already have an account? </span>
              <a 
                href="#/attorney/login" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Login here
              </a>
            </div>

            <div className="mt-2 text-center text-sm">
              <a 
                href="#/" 
                className="text-neutral-600 hover:text-neutral-700"
              >
                ← Back to Advocate Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttorneyRegisterPage;
