import React, { useState, useCallback } from 'react';
import { X, FileText, Calculator, AlertCircle, Sparkles, Plus, Trash2, Download, Timer, Receipt, DollarSign, Percent, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, Search } from 'lucide-react';
import RateCardSelector from '../pricing/RateCardSelector';
import { rateCardService } from '../../services/rate-card.service';
import { PricingCalculator } from '../../utils/PricingCalculator';

interface TimeEntryItem {
  id: string;
  date: string;
  description: string;
  duration: number;
  rate: number;
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  matterId: string;
  invoiced: boolean;
}

interface MatterInfo {
  id: string;
  title: string;
  clientName: string;
  bar: string;
  wipValue: number;
  disbursements: number;
  matterType?: string;
}

interface InvoiceGenerationWizardProps {
  matter?: MatterInfo;
  timeEntries?: TimeEntryItem[];
  expenses?: ExpenseItem[];
  onClose?: () => void;
  onGenerate?: (invoiceData: any) => void;
}

const WIZARD_STEPS = [
  { id: 1, title: 'Select Items', icon: CheckCircle2, description: 'Choose time entries and expenses' },
  { id: 2, title: 'Configure', icon: DollarSign, description: 'Set pricing and discounts' },
  { id: 3, title: 'Review', icon: FileText, description: 'Review and generate' }
];

export function InvoiceGenerationWizard({ 
  matter = {
    id: '',
    title: '',
    clientName: '',
    bar: '',
    wipValue: 0,
    disbursements: 0
  },
  timeEntries: initialTimeEntries = [],
  expenses: initialExpenses = [],
  onClose,
  onGenerate
}: InvoiceGenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [timeEntries] = useState(initialTimeEntries);
  const [selectedEntries, setSelectedEntries] = useState<string[]>(initialTimeEntries.map(e => e.id));
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>(initialExpenses.map(e => e.id));
  const [customNarrative, setCustomNarrative] = useState('');
  const [useAINarrative, setUseAINarrative] = useState(true);
  const [isProForma, setIsProForma] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [hourlyRateOverride, setHourlyRateOverride] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [timeEntrySearch, setTimeEntrySearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'other',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [rateCardEstimate, setRateCardEstimate] = useState<any>(null);
  const [useRateCards, setUseRateCards] = useState(false);
  const [loadingRateCards, setLoadingRateCards] = useState(false);

  const handleEntryToggle = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleExpenseToggle = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Please fill in all expense details');
      return;
    }

    const expense: ExpenseItem = {
      id: `temp_${Date.now()}`,
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category,
      date: newExpense.date,
      matterId: matter.id || '',
      invoiced: false
    };

    setExpenses(prev => [...prev, expense]);
    setSelectedExpenses(prev => [...prev, expense.id]);
    setNewExpense({
      description: '',
      amount: 0,
      category: 'other',
      date: new Date().toISOString().split('T')[0]
    });
    setShowExpenseForm(false);
  };

  const handleServicesChange = async (services: any[]) => {
    setSelectedServices(services);
    
    if (services.length > 0 && matter.matterType) {
      setLoadingRateCards(true);
      try {
        const estimate = await rateCardService.generateProFormaEstimate(
          matter.matterType,
          services.map(s => s.id)
        );
        setRateCardEstimate(estimate);
      } catch (error) {
        console.error('Failed to generate rate card estimate:', error);
        setRateCardEstimate(null);
      } finally {
        setLoadingRateCards(false);
      }
    } else {
      setRateCardEstimate(null);
    }
  };

  const handleRemoveExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    setSelectedExpenses(prev => prev.filter(id => id !== expenseId));
  };

  const calculateTotals = useCallback(() => {
    const selectedTimeEntries = timeEntries.filter(entry => 
      selectedEntries.includes(entry.id)
    );
    
    const selectedExpenseItems = expenses.filter(expense => 
      selectedExpenses.includes(expense.id)
    );
    
    const services = useRateCards && rateCardEstimate 
      ? (rateCardEstimate.line_items || []).map((item: any) => ({
          id: item.id,
          name: item.service_name,
          pricing_type: item.pricing_type as 'hourly' | 'fixed' | 'contingency',
          hourly_rate: item.hourly_rate,
          fixed_fee: item.fixed_fee,
          estimated_hours: item.estimated_hours,
          quantity: item.quantity,
          description: item.description,
        }))
      : [];

    const timeEntriesForCalc = selectedTimeEntries.map(entry => ({
      id: entry.id,
      hours: entry.duration / 60,
      rate: hourlyRateOverride ? parseFloat(hourlyRateOverride) : entry.rate,
      description: entry.description,
      date: entry.date,
    }));

    const expenseItems = selectedExpenseItems.map(expense => ({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      category: expense.category || 'general',
      vat_applicable: true,
    }));

    const discountValue = discountType === 'percentage' ? discountPercentage : discountAmount;
    const discount = discountValue > 0 ? {
      type: discountType as 'percentage' | 'fixed',
      value: discountValue,
      description: 'Invoice discount',
    } : undefined;

    const result = PricingCalculator.calculate(
      services,
      timeEntriesForCalc,
      expenseItems,
      discount
    );

    const totalHours = selectedTimeEntries.reduce((sum, entry) => 
      sum + (entry.duration / 60), 0
    );
    
    const disbursements = matter.disbursements || 0;
    const totalAmount = result.total + disbursements;

    return {
      totalHours,
      totalFees: result.timeEntriesTotal,
      totalExpenses: result.expensesTotal,
      rateCardTotal: result.servicesTotal,
      discountValue: result.discountAmount,
      discountedFees: result.timeEntriesTotal + result.servicesTotal - result.discountAmount,
      disbursements,
      vatAmount: result.vatAmount,
      totalAmount
    };
  }, [timeEntries, selectedEntries, expenses, selectedExpenses, discountAmount, discountPercentage, discountType, hourlyRateOverride, matter.disbursements, useRateCards, rateCardEstimate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatRand = (amount: number) => {
    return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const filteredTimeEntries = timeEntries.filter(entry =>
    entry.description.toLowerCase().includes(timeEntrySearch.toLowerCase()) ||
    formatDate(entry.date).toLowerCase().includes(timeEntrySearch.toLowerCase())
  );

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
    expense.category.toLowerCase().includes(expenseSearch.toLowerCase())
  );

  const totals = calculateTotals();

  const canProceed = () => {
    if (currentStep === 1) {
      return selectedEntries.length > 0 || selectedExpenses.length > 0 || (useRateCards && selectedServices.length > 0);
    }
    return true;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = () => {
    if (onGenerate) {
      const invoiceData = {
        matterId: matter.id,
        isProForma,
        selectedTimeEntries: selectedEntries,
        selectedExpenses,
        selectedServices: useRateCards ? selectedServices : [],
        discount: {
          type: discountType,
          value: discountType === 'percentage' ? discountPercentage : discountAmount
        },
        hourlyRateOverride: hourlyRateOverride ? parseFloat(hourlyRateOverride) : null,
        narrative: useAINarrative ? null : customNarrative,
        useAINarrative,
        totals
      };
      onGenerate(invoiceData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => {}}
                className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Time Entries</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">{selectedEntries.length} selected</div>
              </button>
              <button
                onClick={() => {}}
                className="p-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Receipt className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-900 dark:text-green-100">Expenses</div>
                <div className="text-xs text-green-700 dark:text-green-300">{selectedExpenses.length} selected</div>
              </button>
              <button
                onClick={() => setUseRateCards(!useRateCards)}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  useRateCards 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-indigo-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${useRateCards ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
                <div className={`text-sm font-medium ${useRateCards ? 'text-indigo-900 dark:text-indigo-100' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  Rate Cards
                </div>
                <div className={`text-xs ${useRateCards ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-500'}`}>
                  {useRateCards ? 'Enabled' : 'Click to enable'}
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    Billable Time Entries
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={timeEntrySearch}
                      onChange={(e) => setTimeEntrySearch(e.target.value)}
                      placeholder="Search time entries..."
                      className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg text-sm bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredTimeEntries.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      <Timer className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                      <p className="text-sm">No time entries available</p>
                    </div>
                  ) : (
                    filteredTimeEntries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleEntryToggle(entry.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedEntries.includes(entry.id)
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-neutral-200 dark:border-metallic-gray-700 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={() => handleEntryToggle(entry.id)}
                            className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {formatDate(entry.date)}
                              </span>
                              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRand((entry.duration / 60) * entry.rate)}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">{entry.description}</p>
                            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                              <span>{(entry.duration / 60).toFixed(1)} hours</span>
                              <span>@ {formatRand(entry.rate)}/hour</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-green-600" />
                    Expenses & Disbursements
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        value={expenseSearch}
                        onChange={(e) => setExpenseSearch(e.target.value)}
                        placeholder="Search expenses..."
                        className="pl-10 pr-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg text-sm bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <button
                      onClick={() => setShowExpenseForm(!showExpenseForm)}
                      className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {showExpenseForm && (
                  <div className="bg-neutral-50 dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4 mb-3">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">New Expense</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                          placeholder="Description"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                          placeholder="Amount (R)"
                        />
                      </div>
                      <div>
                        <select
                          value={newExpense.category}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                        >
                          <option value="court_fees">Court Fees</option>
                          <option value="travel">Travel</option>
                          <option value="printing">Printing</option>
                          <option value="research">Research</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowExpenseForm(false)}
                        className="px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddExpense}
                        className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                      >
                        Add Expense
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredExpenses.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      <Receipt className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                      <p className="text-sm">No expenses added</p>
                    </div>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className={`p-3 border rounded-lg transition-all ${
                          selectedExpenses.includes(expense.id)
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-neutral-200 dark:border-metallic-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedExpenses.includes(expense.id)}
                            onChange={() => handleExpenseToggle(expense.id)}
                            className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-neutral-900 dark:text-neutral-100">{expense.description}</span>
                              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRand(expense.amount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                              <span className="capitalize">{expense.category.replace('_', ' ')}</span>
                              <span>{formatDate(expense.date)}</span>
                            </div>
                          </div>
                          {expense.id.startsWith('temp_') && (
                            <button
                              onClick={() => handleRemoveExpense(expense.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {useRateCards && (
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Rate Card Services
                  </h3>
                  <RateCardSelector
                    matterType={matter.matterType || 'general'}
                    onServicesChange={handleServicesChange}
                  />
                  
                  {loadingRateCards && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Calculating estimate...</span>
                      </div>
                    </div>
                  )}

                  {rateCardEstimate && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-3">
                      <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-3">Rate Card Estimate</h4>
                      <div className="space-y-2">
                        {(rateCardEstimate.line_items || []).map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-indigo-800 dark:text-indigo-200">{item.description}</span>
                            <span className="font-medium text-indigo-900 dark:text-indigo-100">
                              {formatRand(item.total_amount)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-indigo-200 dark:border-indigo-700 pt-2 mt-2">
                          <div className="flex justify-between items-center font-medium">
                            <span className="text-indigo-900 dark:text-indigo-100">Total Services</span>
                            <span className="text-indigo-900 dark:text-indigo-100">
                              {formatRand(rateCardEstimate.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Invoice Type</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isProForma}
                    onChange={() => setIsProForma(false)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">Final Invoice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isProForma}
                    onChange={() => setIsProForma(true)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">Pro Forma</span>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Discount</h4>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={discountType === 'amount'}
                    onChange={() => setDiscountType('amount')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <DollarSign className="w-4 h-4" />
                  <span className="text-neutral-700 dark:text-neutral-300">Fixed Amount</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={discountType === 'percentage'}
                    onChange={() => setDiscountType('percentage')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <Percent className="w-4 h-4" />
                  <span className="text-neutral-700 dark:text-neutral-300">Percentage</span>
                </label>
              </div>
              <div className="w-1/2">
                {discountType === 'amount' ? (
                  <input
                    type="number"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="Discount Amount (R)"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="Discount (%)"
                  />
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Fee Structure Override</h4>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Hourly Rate (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRateOverride}
                  onChange={(e) => setHourlyRateOverride(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="Leave empty for default"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Fee Narrative</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAINarrative}
                    onChange={(e) => setUseAINarrative(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Use AI</span>
                </label>
              </div>
              {!useAINarrative && (
                <textarea
                  value={customNarrative}
                  onChange={(e) => setCustomNarrative(e.target.value)}
                  placeholder="Enter custom fee narrative..."
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg resize-none bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                />
              )}
              {useAINarrative && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    AI will generate a professional, Bar Council compliant fee narrative
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">Ready to Generate</h3>
              <p className="text-green-700 dark:text-green-300">Review the summary below and generate your {isProForma ? 'pro forma' : 'invoice'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Matter Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Title:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{matter.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Client:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{matter.clientName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Bar:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{matter.bar}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Invoice Type</h4>
                <div className="text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${
                    isProForma 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  }`}>
                    {isProForma ? 'Pro Forma Invoice' : 'Final Invoice'}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Selected Items</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Time Entries:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{selectedEntries.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Expenses:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{selectedExpenses.length}</dd>
                  </div>
                  {useRateCards && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Rate Card Services:</dt>
                      <dd className="font-medium text-neutral-900 dark:text-neutral-100">{selectedServices.length}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Financial Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Total Hours:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{totals.totalHours.toFixed(1)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Professional Fees:</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{formatRand(totals.totalFees)}</dd>
                  </div>
                  {totals.discountValue > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <dt>Discount:</dt>
                      <dd className="font-medium">-{formatRand(totals.discountValue)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">Total Amount (incl. VAT)</div>
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{formatRand(totals.totalAmount)}</div>
                </div>
                <div className="text-right text-sm text-amber-700 dark:text-amber-300">
                  <div>VAT: {formatRand(totals.vatAmount)}</div>
                  {totals.disbursements > 0 && <div>Disbursements: {formatRand(totals.disbursements)}</div>}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-xl shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Generate Invoice</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {matter.title || 'No Matter Selected'} • {matter.clientName || 'No Client'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-neutral-200 dark:bg-metallic-gray-700 text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className={`font-semibold ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{step.description}</div>
                    </div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-neutral-200 dark:bg-metallic-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {renderStepContent()}
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Step {currentStep} of {WIZARD_STEPS.length}
            </div>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-300 dark:border-metallic-gray-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Calculator className="w-5 h-5" />
                  Generate {isProForma ? 'Pro Forma' : 'Invoice'}
                </button>
              )}
            </div>
          </div>
          
          {!canProceed() && currentStep === 1 && (
            <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>Select at least one time entry, expense, or rate card service to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
