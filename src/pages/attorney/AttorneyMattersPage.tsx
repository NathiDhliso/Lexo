import React, { useState } from 'react';
import { Card, CardContent, Button } from '../../components/design-system/components';
import { Briefcase } from 'lucide-react';

interface Matter {
  id: string;
  name: string;
  status: string;
  client: string;
}

export const AttorneyMattersPage: React.FC = () => {
  const [matters] = useState<Matter[]>(
    Array.from({ length: 5 }, (_, i) => ({
      id: `matter-${i}`,
      name: i === 2 ? 'Corporate Merger Case' : `Matter ${i + 1}`,
      status: 'active',
      client: `Client ${i + 1}`
    }))
  );

  const [stateFilter, setStateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);

  const filteredMatters = matters.filter(m => {
    if (stateFilter && m.status !== stateFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        My Matters
      </h1>

      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Status</label>
          <select
            id="stateFilter"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            placeholder="Search matters..."
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredMatters.map(matter => (
          <Card
            key={matter.id}
            data-matter-id={matter.id}
            className="cursor-pointer hover:theme-shadow-md transition-shadow"
            onClick={() => setSelectedMatter(matter)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {matter.name}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Client: {matter.client} • Status: {matter.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMatter && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Matter Details</h2>
            <div>
              <strong>Matter Name:</strong> {selectedMatter.name}
            </div>
            <div>
              <strong>Client:</strong> {selectedMatter.client}
            </div>
            <div>
              <strong>Status:</strong> {selectedMatter.status}
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold mb-2">Time Entries</h3>
              <p className="text-neutral-600">No time entries yet</p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold mb-2">Expenses</h3>
              <p className="text-neutral-600">No expenses yet</p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold mb-2">Invoices</h3>
              <p className="text-neutral-600">No invoices yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttorneyMattersPage;
