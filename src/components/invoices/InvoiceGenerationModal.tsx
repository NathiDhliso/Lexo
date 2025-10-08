import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Clock, Calculator, AlertCircle, Sparkles, Eye, Plus, Trash2, Download, Timer, Receipt, Settings, DollarSign, Percent, CreditCard } from 'lucide-react';
import RateCardSelector, { SelectedService } from '../pricing/RateCardSelector';
import { rateCardService, ProFormaEstimate } from '../../services/rate-card.service';
import { PricingCalculator, ServiceItem, TimeEntry, Expense, DiscountConfig } from '../../utils/PricingCalculator';

interface TimeEntry {
  id: string;
  date: string;
  description: string;
  duration: number;
  rate: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  matterId: string;
  invoiced: boolean;
}

interface Matter {
  id: string;
  title: string;
  clientName: string;
  bar: string;
  wipValue: number;
  disbursements: number;
  matterType?: string;
}

interface InvoiceGenerationModalProps {
  matter?: Matter;
  timeEntries?: TimeEntry[];
  expenses?: Expense[];
  onClose?: () => void;
  onGenerate?: (invoiceData: any) => void;
}

export function InvoiceGenerationModal({ 
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
}: InvoiceGenerationModalProps) {
  const [timeEntries] = useState(initialTimeEntries);
  const [selectedEntries, setSelectedEntries] = useState(initialTimeEntries.map(e => e.id));
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selectedExpenses, setSelectedExpenses] = useState(initialExpenses.map(e => e.id));
  const [customNarrative, setCustomNarrative] = useState('');
  const [useAINarrative, setUseAINarrative] = useState(true);
  const [isProForma, setIsProForma] = useState(false);
  const [activeTab, setActiveTab] = useState('time');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountType, setDiscountType] = useState('amount');
  const [hourlyRateOverride, setHourlyRateOverride] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'other',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Rate card related state
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [rateCardEstimate, setRateCardEstimate] = useState<ProFormaEstimate | null>(null);
  const [useRateCards, setUseRateCards] = useState(false);
  const [loadingRateCards, setLoadingRateCards] = useState(false);

  const handleEntryToggle = (entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleExpenseToggle = (expenseId) => {
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

    const expense = {
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

  // Rate card services handlers
  const handleServicesChange = async (services: SelectedService[]) => {
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

  const toggleRateCards = () => {
    setUseRateCards(!useRateCards);
    if (!useRateCards && selectedServices.length === 0) {
      setActiveTab('services');
    }
  };

  const handleRemoveExpense = (expenseId) => {
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
    
    // Convert data to PricingCalculator format
    const services: ServiceItem[] = useRateCards && rateCardEstimate 
      ? rateCardEstimate.lineItems.map(item => ({
          id: item.id,
          name: item.serviceName,
          pricing_type: item.pricingType as 'hourly' | 'fixed' | 'contingency',
          hourly_rate: item.hourlyRate,
          fixed_fee: item.fixedFee,
          estimated_hours: item.estimatedHours,
          quantity: item.quantity,
          description: item.description,
        }))
      : [];

    const timeEntriesForCalc: TimeEntry[] = selectedTimeEntries.map(entry => ({
      id: entry.id,
      hours: entry.duration / 60,
      rate: hourlyRateOverride ? parseFloat(hourlyRateOverride) : entry.rate,
      description: entry.description,
      date: entry.date,
    }));

    const expenseItems: Expense[] = selectedExpenseItems.map(expense => ({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      category: expense.category || 'general',
      vat_applicable: true,
    }));

    const discountValue = discountType === 'percentage' ? discountPercentage : discountAmount;
    const discount: DiscountConfig | undefined = discountValue > 0 ? {
      type: discountType as 'percentage' | 'fixed',
      value: discountValue,
      description: 'Invoice discount',
    } : undefined;

    // Calculate using PricingCalculator
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatRand = (amount) => {
    return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-xl shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
              <p className="text-sm text-gray-600 mt-1">
                {matter.title || 'No Matter Selected'} • {matter.clientName || 'No Client'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { id: 'time', label: 'Time Entries', icon: Timer, color: 'blue' },
                    { id: 'expenses', label: 'Expenses', icon: Receipt, color: 'green' },
                    { id: 'services', label: 'Services', icon: CreditCard, color: 'indigo' },
                    { id: 'settings', label: 'Settings', icon: Settings, color: 'purple' }
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
                        activeTab === id
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Time Entries Tab */}
            {activeTab === 'time' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Billable Time Entries</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Select time entries to include in this invoice
                  </p>
                </div>

                <div className="space-y-3">
                  {timeEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No time entries available</p>
                      <p className="text-sm">Time entries will appear here when added to the matter</p>
                    </div>
                  ) : (
                    timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => handleEntryToggle(entry.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedEntries.includes(entry.id)
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
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
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(entry.date)}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatRand((entry.duration / 60) * entry.rate)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{entry.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
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
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900">Expenses & Disbursements</h3>
                      <p className="text-sm text-green-700">Add and select expenses to include</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                </div>

                {showExpenseForm && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">New Expense</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Enter expense description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (R)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={newExpense.category}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="court_fees">Court Fees</option>
                          <option value="travel">Travel</option>
                          <option value="printing">Printing</option>
                          <option value="research">Research</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowExpenseForm(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddExpense}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Add Expense
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {expenses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No expenses added</p>
                      <p className="text-sm">Click "Add Expense" to include expenses in this invoice</p>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedExpenses.includes(expense.id)
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200'
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
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{expense.description}</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatRand(expense.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{expense.category.replace('_', ' ')}</span>
                            <span>{formatDate(expense.date)}</span>
                          </div>
                        </div>
                        {expense.id.startsWith('temp_') && (
                          <button
                            onClick={() => handleRemoveExpense(expense.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
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
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-indigo-900">Rate Card Services</h3>
                      <p className="text-sm text-indigo-700">Add standardized services from rate cards</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useRateCards}
                      onChange={toggleRateCards}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Include rate card services
                    </span>
                  </label>
                </div>

                {useRateCards ? (
                  <div className="space-y-4">
                    <RateCardSelector
                      matterType={matter.matterType || 'general'}
                      onServicesChange={handleServicesChange}
                      selectedServices={selectedServices}
                    />
                    
                    {loadingRateCards && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                          <span className="text-sm text-gray-600">Calculating estimate...</span>
                        </div>
                      </div>
                    )}

                    {rateCardEstimate && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-medium text-indigo-900 mb-3">Rate Card Estimate</h4>
                        <div className="space-y-2">
                          {rateCardEstimate.lineItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-indigo-800">{item.description}</span>
                              <span className="font-medium text-indigo-900">
                                {formatRand(item.totalAmount)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-indigo-200 pt-2 mt-2">
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-indigo-900">Total Services</span>
                              <span className="text-indigo-900">
                                {formatRand(rateCardEstimate.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">Rate card services not included</p>
                    <p className="text-sm">Enable the checkbox above to add standardized services</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Invoice Type */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Invoice Type</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isProForma}
                        onChange={() => setIsProForma(false)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">Final Invoice</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isProForma}
                        onChange={() => setIsProForma(true)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">Pro Forma</span>
                    </label>
                  </div>
                </div>

                {/* Discount */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Discount</h4>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={discountType === 'amount'}
                        onChange={() => setDiscountType('amount')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <DollarSign className="w-4 h-4" />
                      <span className="text-gray-700">Fixed Amount</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={discountType === 'percentage'}
                        onChange={() => setDiscountType('percentage')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <Percent className="w-4 h-4" />
                      <span className="text-gray-700">Percentage</span>
                    </label>
                  </div>
                  <div className="w-1/2">
                    {discountType === 'amount' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Discount Amount (R)"
                      />
                    ) : (
                      <input
                        type="number"
                        step="0.1"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Discount (%)"
                      />
                    )}
                  </div>
                </div>

                {/* Fee Structure Override */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Fee Structure Override</h4>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate (R)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={hourlyRateOverride}
                      onChange={(e) => setHourlyRateOverride(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Leave empty for default"
                    />
                  </div>
                </div>

                {/* Fee Narrative */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Fee Narrative</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAINarrative}
                        onChange={(e) => setUseAINarrative(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-700">Use AI</span>
                    </label>
                  </div>
                  {!useAINarrative && (
                    <textarea
                      value={customNarrative}
                      onChange={(e) => setCustomNarrative(e.target.value)}
                      placeholder="Enter custom fee narrative..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  )}
                  {useAINarrative && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        AI will generate a professional, Bar Council compliant fee narrative
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="w-80 bg-gray-50 p-6 border-l border-gray-200 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>

            <div className="flex-1 space-y-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {matter.bar} Bar
                </div>
                <div className="text-xs text-gray-600">
                  Payment Terms: 60 days
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours:</span>
                  <span className="font-medium">{totals.totalHours.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professional Fees:</span>
                  <span className="font-medium">{formatRand(totals.totalFees)}</span>
                </div>
                {totals.totalExpenses > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expenses:</span>
                    <span className="font-medium">{formatRand(totals.totalExpenses)}</span>
                  </div>
                )}
                {useRateCards && totals.rateCardTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate Card Services:</span>
                    <span className="font-medium">{formatRand(totals.rateCardTotal)}</span>
                  </div>
                )}
                {totals.discountValue > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatRand(totals.discountValue)}</span>
                  </div>
                )}
                {totals.disbursements > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disbursements:</span>
                    <span className="font-medium">{formatRand(totals.disbursements)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (15%):</span>
                  <span className="font-medium">{formatRand(totals.vatAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-xl text-gray-900">
                    {formatRand(totals.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedEntries.length === 0 && selectedExpenses.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Select at least one time entry or expense
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 mt-6">
              <button
                disabled={selectedEntries.length === 0 && selectedExpenses.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Calculator className="w-5 h-5" />
                Generate {isProForma ? 'Pro Forma' : 'Invoice'}
              </button>
              <button
                disabled={selectedEntries.length === 0 && selectedExpenses.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-5 h-5" />
                Preview PDF
              </button>
              <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
