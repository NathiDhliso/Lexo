import React, { useState } from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../components/design-system/components';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: string;
  timestamp: string;
  ipAddress: string;
  changes: Record<string, any>;
}

export const AuditTrailPage: React.FC = () => {
  const [auditEntries] = useState<AuditEntry[]>(
    Array.from({ length: 20 }, (_, i) => ({
      id: `audit-${i}`,
      action: i % 3 === 0 ? 'proforma_created' : i % 2 === 0 ? 'invoice_updated' : 'matter_created',
      entityType: i % 3 === 0 ? 'proforma_requests' : i % 2 === 0 ? 'invoices' : 'matters',
      entityId: `entity-${i}`,
      user: 'John Advocate',
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      ipAddress: `192.168.1.${i}`,
      changes: { field: 'status', old: 'draft', new: 'sent' }
    }))
  );

  const [filteredEntries, setFilteredEntries] = useState(auditEntries);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [entityType, setEntityType] = useState('');

  const handleFilter = () => {
    let filtered = auditEntries;

    if (entityType) {
      filtered = filtered.filter(e => e.entityType === entityType);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.timestamp);
        return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
      });
    }

    if (userSearch) {
      filtered = filtered.filter(e => e.user.toLowerCase().includes(userSearch.toLowerCase()));
    }

    setFilteredEntries(filtered);
  };

  const handleSearch = () => {
    handleFilter();
  };

  const exportAuditTrail = () => {
    const csv = [
      ['Action', 'Entity Type', 'User', 'Timestamp', 'IP Address'].join(','),
      ...filteredEntries.map(e => [
        e.action,
        e.entityType,
        e.user,
        e.timestamp,
        e.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Audit Trail
        </h1>
        <Button onClick={exportAuditTrail} variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          Export Audit Trail
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entity Type</label>
              <input
                id="entityType"
                type="text"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., proforma_requests"
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">User Search</label>
              <div className="flex gap-2">
                <input
                  id="userSearch"
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Search by user"
                />
                <Button onClick={handleSearch} variant="secondary">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleFilter} variant="primary">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filteredEntries.map(entry => (
          <Card
            key={entry.id}
            data-audit-entry={entry.id}
            className="cursor-pointer hover:theme-shadow-md transition-shadow"
            onClick={() => setSelectedEntry(entry)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {entry.action}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {entry.user} • {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm text-neutral-500">{entry.entityType}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedEntry && (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-xl font-bold">Audit Entry Details</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div>
              <strong>Action:</strong> {selectedEntry.action}
            </div>
            <div>
              <strong>User:</strong> {selectedEntry.user}
            </div>
            <div>
              <strong>Timestamp:</strong> {new Date(selectedEntry.timestamp).toLocaleString()}
            </div>
            <div>
              <strong>IP Address:</strong> {selectedEntry.ipAddress}
            </div>
            <div>
              <strong>Changes:</strong>
              <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
                {JSON.stringify(selectedEntry.changes, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTrailPage;
