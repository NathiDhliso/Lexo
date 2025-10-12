import React, { useState, useEffect } from 'react';
import { X, FileText, Search, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UnifiedInvoiceWizard } from './UnifiedInvoiceWizard';
import { toast } from 'react-hot-toast';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (invoice: any) => void;
  preselectedMatterId?: string;
}

interface Matter {
  id: string;
  title: string;
  client_name: string;
  bar: string;
  matter_type?: string;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedMatterId
}) => {
  const [step, setStep] = useState<'select' | 'generate'>('select');
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (preselectedMatterId) {
        loadMatterById(preselectedMatterId);
      } else {
        loadMatters();
      }
    }
  }, [isOpen, preselectedMatterId]);

  const loadMatters = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('matters')
        .select('id, title, client_name, bar, matter_type')
        .eq('advocate_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatters(data || []);
    } catch (error: any) {
      console.error('Error loading matters:', error);
      toast.error('Failed to load matters');
    } finally {
      setLoading(false);
    }
  };

  const loadMatterById = async (matterId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matters')
        .select('id, title, client_name, bar, matter_type')
        .eq('id', matterId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedMatter(data);
        setStep('generate');
      }
    } catch (error: any) {
      console.error('Error loading matter:', error);
      toast.error('Failed to load matter');
    } finally {
      setLoading(false);
    }
  };

  const handleMatterSelect = (matter: Matter) => {
    setSelectedMatter(matter);
    setStep('generate');
  };

  const handleBack = () => {
    setSelectedMatter(null);
    setStep('select');
  };

  const handleGenerate = (invoiceData: any) => {
    toast.success('Invoice generated successfully');
    if (onSuccess) {
      onSuccess(invoiceData);
    }
    onClose();
  };

  const filteredMatters = matters.filter(matter =>
    matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    matter.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {step === 'select' ? (
          <>
            <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    Generate Invoice
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Select a matter to generate an invoice
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search matters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-amber-600" />
                </div>
              ) : filteredMatters.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-neutral-400">
                    {searchQuery ? 'No matters found matching your search' : 'No active matters found'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredMatters.map((matter) => (
                    <button
                      key={matter.id}
                      onClick={() => handleMatterSelect(matter)}
                      className="text-left p-4 border border-gray-200 dark:border-metallic-gray-700 rounded-lg hover:border-amber-500 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-neutral-100">
                            {matter.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                            {matter.client_name}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-metallic-gray-800 text-gray-700 dark:text-neutral-300 rounded">
                              {matter.bar}
                            </span>
                            {matter.matter_type && (
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                {matter.matter_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <FileText className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : selectedMatter ? (
          <UnifiedInvoiceWizard
            matter={{
              id: selectedMatter.id,
              title: selectedMatter.title,
              clientName: selectedMatter.client_name,
              bar: selectedMatter.bar,
              matterType: selectedMatter.matter_type
            }}
            onClose={handleBack}
            onGenerate={handleGenerate}
          />
        ) : null}
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
