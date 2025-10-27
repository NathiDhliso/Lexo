import React, { useState } from 'react';
import { X, FileText, Plus, Save } from 'lucide-react';
import { Button, Input, Textarea } from '../design-system/components';
import { LogServiceModal } from '../services/LogServiceModal';
import { TimeEntryModal } from '../time-entries/TimeEntryModal';
import { QuickDisbursementModal } from '../expenses/QuickDisbursementModal';
import { LoggedServicesService } from '../../services/api/logged-services.service';
import { TimeEntryService } from '../../services/api/time-entries.service';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface SimpleProFormaModalProps {
  matterId: string;
  matterTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (proFormaId: string) => void;
}

export const SimpleProFormaModal: React.FC<SimpleProFormaModalProps> = ({
  matterId,
  matterTitle,
  isOpen,
  onClose,
  onSave,
}) => {
  const [proFormaId, setProFormaId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const createProForma = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pro_forma_requests')
        .insert({
          matter_id: matterId,
          advocate_id: user.id,
          work_title: title,
          work_description: description,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      setProFormaId(data.id);
      toast.success('Pro Forma created. Now add line items.');
      return data.id;
    } catch (error) {
      console.error('Error creating Pro Forma:', error);
      toast.error('Failed to create Pro Forma');
      throw error;
    }
  };

  const handleAddService = async () => {
    let currentProFormaId = proFormaId;
    if (!currentProFormaId) {
      currentProFormaId = await createProForma();
      if (!currentProFormaId) return;
      setProFormaId(currentProFormaId); // ✅ Set state immediately
    }
    setShowServiceModal(true);
  };

  const handleAddTime = async () => {
    let currentProFormaId = proFormaId;
    if (!currentProFormaId) {
      currentProFormaId = await createProForma();
      if (!currentProFormaId) return;
      setProFormaId(currentProFormaId); // ✅ Set state immediately
    }
    setShowTimeModal(true);
  };

  const handleAddExpense = async () => {
    let currentProFormaId = proFormaId;
    if (!currentProFormaId) {
      currentProFormaId = await createProForma();
      if (!currentProFormaId) return;
      setProFormaId(currentProFormaId); // ✅ Set state immediately
    }
    setShowExpenseModal(true);
  };

  const refreshLineItems = async () => {
    if (!proFormaId) return;

    try {
      const servicesData = await LoggedServicesService.getServicesByMatter(matterId, true);
      setServices(servicesData.filter(s => s.pro_forma_id === proFormaId));

      // Similar for time and expenses
      // This is simplified - full implementation would fetch all types
    } catch (error) {
      console.error('Error refreshing line items:', error);
    }
  };

  const handleSave = async () => {
    if (!proFormaId) {
      await createProForma();
    }

    setIsSaving(true);
    try {
      // Update Pro Forma status
      const { error } = await supabase
        .from('pro_forma_requests')
        .update({ status: 'sent' })
        .eq('id', proFormaId);

      if (error) throw error;

      toast.success('Pro Forma saved successfully');
      onSave(proFormaId!);
      onClose();
    } catch (error) {
      console.error('Error saving Pro Forma:', error);
      toast.error('Failed to save Pro Forma');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotal = () => {
    const servicesTotal = services.reduce((sum, s) => sum + s.amount, 0);
    const timeTotal = timeEntries.reduce((sum, t) => sum + t.amount, 0);
    const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    return servicesTotal + timeTotal + expensesTotal;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600 dark:text-mpondo-gold-400" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Create Pro Forma Estimate
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{matterTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Legal Services for Case XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the work to be performed..."
                  rows={3}
                />
              </div>
            </div>

            {/* Add Line Items */}
            <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Line Items
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={handleAddService}
                  className="flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAddTime}
                  className="flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Time
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAddExpense}
                  className="flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </Button>
              </div>

              {/* Line Items Summary */}
              <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Services:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {services.length} items
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Time Entries:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {timeEntries.length} items
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Expenses:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {expenses.length} items
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-metallic-gray-700">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">Total:</span>
                    <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                      R{calculateTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Pro Forma'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {proFormaId && (
        <>
          <LogServiceModal
            matterId={matterId}
            matterTitle={matterTitle}
            isOpen={showServiceModal}
            onClose={() => setShowServiceModal(false)}
            onSave={() => {
              setShowServiceModal(false);
              refreshLineItems();
            }}
            isEstimate={true}
            proFormaId={proFormaId}
          />

          <TimeEntryModal
            matterId={matterId}
            matterTitle={matterTitle}
            isOpen={showTimeModal}
            onClose={() => setShowTimeModal(false)}
            onSave={() => {
              setShowTimeModal(false);
              refreshLineItems();
            }}
          />

          <QuickDisbursementModal
            matterId={matterId}
            isOpen={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            onSuccess={() => {
              setShowExpenseModal(false);
              refreshLineItems();
            }}
          />
        </>
      )}
    </>
  );
};
