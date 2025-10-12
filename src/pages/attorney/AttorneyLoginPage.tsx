import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/design-system/components';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export const AttorneyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user is an attorney
        const { data: attorneyData, error: attorneyError } = await supabase
          .from('attorney_users')
          .select('*')
          .eq('email', formData.email.trim().toLowerCase())
          .single();

        if (attorneyError || !attorneyData) {
          // Not an attorney user
          await supabase.auth.signOut();
          toast.error('No attorney account found with this email. Please register first.');
          setIsSubmitting(false);
          return;
        }

        toast.success('Login successful!');
        navigate('/attorney/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Client Portal Login</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2">
            Access your matters, invoices, and documents
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-neutral-600">Don't have an account? </span>
              <a 
                href="#/attorney/register" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
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

export default AttorneyLoginPage;
