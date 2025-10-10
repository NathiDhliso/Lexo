import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../components/design-system/components';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [matterType, setMatterType] = useState('');
  const [includeWIP, setIncludeWIP] = useState(false);
  const [includeInvoices, setIncludeInvoices] = useState(false);
  const [includePayments, setIncludePayments] = useState(false);

  const generateReport = (reportType: string) => {
    setActiveReport(reportType);
  };

  const exportToCSV = () => {
    const csv = 'Report Data\nSample,Data\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const blob = new Blob(['PDF Content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Reports & Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('wip')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">WIP Report</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('revenue')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Revenue Report</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('pipeline')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Matter Pipeline</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('client-revenue')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Client Revenue Report</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('time-entry')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Time Entry Summary</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('outstanding')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Outstanding Invoices</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('aging')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Aging Report</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('profitability')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Matter Profitability</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateReport('custom')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary-600" />
            <h3 className="font-bold">Custom Report</h3>
          </CardContent>
        </Card>
      </div>

      {activeReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {activeReport === 'wip' && 'WIP Report'}
                {activeReport === 'revenue' && 'Revenue Report'}
                {activeReport === 'pipeline' && 'Matter Pipeline'}
                {activeReport === 'client-revenue' && 'Client Revenue'}
                {activeReport === 'time-entry' && 'Time Entry Summary Report'}
                {activeReport === 'outstanding' && 'Outstanding Invoices'}
                {activeReport === 'aging' && 'Aging Report'}
                {activeReport === 'profitability' && 'Matter Profitability'}
                {activeReport === 'custom' && 'Custom Report'}
              </h2>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
                <Button onClick={exportToPDF} variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {activeReport === 'revenue' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Matter Type</label>
                  <select
                    id="matterType"
                    value={matterType}
                    onChange={(e) => setMatterType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">All Types</option>
                    <option value="Litigation">Litigation</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              )}

              {activeReport === 'custom' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeWIP"
                      checked={includeWIP}
                      onChange={(e) => setIncludeWIP(e.target.checked)}
                    />
                    Include WIP
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includeInvoices"
                      checked={includeInvoices}
                      onChange={(e) => setIncludeInvoices(e.target.checked)}
                    />
                    Include Invoices
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="includePayments"
                      checked={includePayments}
                      onChange={(e) => setIncludePayments(e.target.checked)}
                    />
                    Include Payments
                  </label>
                </div>
              )}

              <Button onClick={() => {}} variant="primary">
                Generate Report
              </Button>
            </div>

            <div className="space-y-4">
              {activeReport === 'wip' && (
                <>
                  <div className="text-2xl font-bold">Total Unbilled: R 150,000</div>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} data-matter-wip={`matter-${i}`} className="p-4 border rounded-lg">
                      <div className="font-medium">Matter {i + 1}</div>
                      <div className="text-sm text-neutral-600">WIP: R {(i + 1) * 15000}</div>
                    </div>
                  ))}
                </>
              )}

              {activeReport === 'revenue' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-neutral-600">Total Revenue</div>
                      <div className="text-2xl font-bold">R 500,000</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-neutral-600">Paid Invoices</div>
                      <div className="text-2xl font-bold">R 350,000</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-neutral-600">Unpaid Invoices</div>
                      <div className="text-2xl font-bold">R 150,000</div>
                    </div>
                  </div>
                  {matterType && <div className="text-lg font-medium mt-4">Showing: {matterType}</div>}
                </>
              )}

              {activeReport === 'pipeline' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">Active</div>
                    <div className="text-2xl font-bold">25</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">Paused</div>
                    <div className="text-2xl font-bold">5</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">Completed</div>
                    <div className="text-2xl font-bold">120</div>
                  </div>
                </div>
              )}

              {activeReport === 'client-revenue' && (
                <>
                  {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} data-client-revenue={`client-${i}`} className="p-4 border rounded-lg">
                      <div className="font-medium">Client {i + 1}</div>
                      <div className="text-sm text-neutral-600">Revenue: R {(i + 1) * 25000}</div>
                    </div>
                  ))}
                </>
              )}

              {activeReport === 'time-entry' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">Total Hours</div>
                    <div className="text-2xl font-bold">450</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">Total Value</div>
                    <div className="text-2xl font-bold">R 225,000</div>
                  </div>
                </div>
              )}

              {activeReport === 'outstanding' && (
                <>
                  <div className="text-2xl font-bold">Total Outstanding: R 180,000</div>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} data-invoice-status="pending" className="p-4 border rounded-lg">
                      <div className="font-medium">Invoice {i + 1}</div>
                      <div className="text-sm text-neutral-600">Amount: R {(i + 1) * 22500}</div>
                    </div>
                  ))}
                </>
              )}

              {activeReport === 'aging' && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">0-30 days</div>
                    <div className="text-2xl font-bold">R 50,000</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">31-60 days</div>
                    <div className="text-2xl font-bold">R 30,000</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">61-90 days</div>
                    <div className="text-2xl font-bold">R 20,000</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-neutral-600">90+ days</div>
                    <div className="text-2xl font-bold">R 10,000</div>
                  </div>
                </div>
              )}

              {activeReport === 'profitability' && (
                <div className="space-y-4">
                  <div className="text-lg font-medium">Profitability Analysis</div>
                  <div className="text-lg font-medium">Estimated vs Actual</div>
                  <div className="p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-neutral-600">Estimated</div>
                        <div className="text-xl font-bold">R 200,000</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">Actual</div>
                        <div className="text-xl font-bold">R 185,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
