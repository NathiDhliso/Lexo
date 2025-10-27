/**
 * Reusability Showcase Component
 * 
 * Demonstrates the new reusability patterns and hooks.
 * This component shows how to use all the new utilities together.
 */

import React, { useState } from 'react';
import { useDataFetch, useDashboardData } from '../../hooks/useDataFetch';
import { useModalForm, useSimpleModal, useApprovalModal } from '../../hooks/useModalForm';
import { useSearch, commonSorts, commonFilters } from '../../hooks/useSearch';
import { useTable } from '../../hooks/useTable';
import { createValidator, required, email, minLength, matterSchema } from '../../utils/validation.utils';

// Mock data types
interface Matter {
    id: string;
    title: string;
    client_name: string;
    status: 'active' | 'completed' | 'pending';
    estimated_fee: number;
    created_at: string;
    is_urgent: boolean;
}

interface CreateMatterForm {
    title: string;
    client_name: string;
    estimated_fee: number;
    description: string;
}

// Mock API services
const mockMatterService = {
    getAll: async (): Promise<Matter[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            {
                id: '1',
                title: 'Contract Review',
                client_name: 'Acme Corp',
                status: 'active',
                estimated_fee: 5000,
                created_at: '2024-01-15',
                is_urgent: true,
            },
            {
                id: '2',
                title: 'Employment Dispute',
                client_name: 'Tech Solutions',
                status: 'pending',
                estimated_fee: 8000,
                created_at: '2024-01-10',
                is_urgent: false,
            },
            // Add more mock data...
        ];
    },

    create: async (data: CreateMatterForm): Promise<Matter> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            id: Date.now().toString(),
            ...data,
            status: 'active',
            created_at: new Date().toISOString(),
            is_urgent: false,
        };
    },

    delete: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
    },

    bulkDelete: async (ids: string[]): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
    },
};

/**
 * Example: Data Fetching with Caching
 */
function DataFetchingExample() {
    // Using the data fetching hook with caching and auto-refresh
    const { data: matters, isLoading, error, refetch } = useDataFetch(
        'matters-list',
        mockMatterService.getAll,
        {
            refetchInterval: 30000, // Refetch every 30 seconds
            onSuccess: (data) => console.log(`Loaded ${data.length} matters`),
        }
    );

    if (isLoading) return <div className="animate-pulse">Loading matters...</div>;
    if (error) return <div className="text-red-600">Error: {error.message}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Matters ({matters?.length || 0})</h3>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            <div className="grid gap-4">
                {matters?.map(matter => (
                    <div key={matter.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{matter.title}</h4>
                        <p className="text-gray-600">{matter.client_name}</p>
                        <p className="text-sm text-gray-500">
                            ${matter.estimated_fee.toLocaleString()} • {matter.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Example: Modal Form with Validation
 */
function CreateMatterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    // Create validator using the validation utilities
    const validator = createValidator<CreateMatterForm>({
        title: [required(), minLength(3)],
        client_name: [required(), minLength(2)],
        estimated_fee: [required()],
        description: [],
    });

    // Use the modal form hook
    const {
        formData,
        isLoading,
        error,
        validationErrors,
        handleChange,
        handleSubmit,
        reset,
    } = useModalForm({
        initialData: {
            title: '',
            client_name: '',
            estimated_fee: 0,
            description: '',
        },
        onSubmit: async (data) => {
            await mockMatterService.create(data);
        },
        onSuccess: () => {
            onClose();
            // Trigger refetch of matters list
        },
        validate: (data) => {
            const result = validator.validate(data);
            return result.isValid ? null : result.errors;
        },
        successMessage: 'Matter created successfully!',
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Create New Matter</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                        {validationErrors.title && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Client Name</label>
                        <input
                            type="text"
                            value={formData.client_name}
                            onChange={(e) => handleChange('client_name', e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                        {validationErrors.client_name && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.client_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Estimated Fee</label>
                        <input
                            type="number"
                            value={formData.estimated_fee}
                            onChange={(e) => handleChange('estimated_fee', Number(e.target.value))}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                        {validationErrors.estimated_fee && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.estimated_fee}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">{error.message}</div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Matter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * Example: Search and Filter with Table Management
 */
function MattersTable() {
    // Fetch data
    const { data: allMatters = [], isLoading } = useDataFetch(
        'matters-table',
        mockMatterService.getAll
    );

    // Search and filter
    const {
        searchQuery,
        filteredData,
        setSearchQuery,
        addFilter,
        removeFilter,
        setSortBy,
        activeFilters,
        stats,
    } = useSearch(allMatters, {
        searchFields: ['title', 'client_name'],
        filters: {
            status: commonFilters.status,
            urgent: (item) => item.is_urgent,
        },
        sortOptions: {
            date: commonSorts.dateDesc,
            name: commonSorts.nameAsc,
            fee: commonSorts.amountDesc,
        },
        defaultSort: 'date',
    });

    // Table management with selection and bulk actions
    const {
        selectedItems,
        isAllSelected,
        isIndeterminate,
        paginatedData,
        pagination,
        handleSelectItem,
        handleSelectAll,
        handleBulkAction,
        goToPage,
        nextPage,
        prevPage,
    } = useTable(filteredData, {
        pageSize: 5,
        bulkActions: [
            {
                key: 'delete',
                label: 'Delete Selected',
                action: async (items) => {
                    await mockMatterService.bulkDelete(items.map(i => i.id));
                },
                variant: 'danger',
                confirmMessage: 'Are you sure you want to delete {count} matters?',
            },
        ],
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search matters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <select
                    value={activeFilters.status || ''}
                    onChange={(e) => e.target.value ? addFilter('status', e.target.value) : removeFilter('status')}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={activeFilters.urgent || false}
                        onChange={(e) => e.target.checked ? addFilter('urgent', true) : removeFilter('urgent')}
                        className="mr-2"
                    />
                    Urgent Only
                </label>

                <select
                    onChange={(e) => setSortBy(e.target.value || null)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="">Sort by...</option>
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="fee">Fee</option>
                </select>
            </div>

            {/* Stats */}
            <div className="text-sm text-gray-600">
                Showing {stats.filtered} of {stats.total} matters
                {stats.hasActiveFilters && ' (filtered)'}
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">{selectedItems.length} selected</span>
                    <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isIndeterminate;
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Client</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((matter, index) => (
                            <tr key={matter.id} className="border-t hover:bg-gray-50">
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(matter)}
                                        onChange={(e) => handleSelectItem(matter, e.target.checked)}
                                    />
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center">
                                        {matter.title}
                                        {matter.is_urgent && (
                                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">{matter.client_name}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${matter.status === 'active' ? 'bg-green-100 text-green-800' :
                                        matter.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {matter.status}
                                    </span>
                                </td>
                                <td className="p-3">${matter.estimated_fee.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Showing {pagination.startIndex + 1} to {pagination.endIndex} of {pagination.totalItems}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={prevPage}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm">
                        Page {pagination.currentPage + 1} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Main Showcase Component
 */
export default function ReusabilityShowcase() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Reusability Showcase</h1>
                <p className="text-gray-600">
                    Demonstrating the new reusable hooks and utilities
                </p>
            </div>

            {/* Data Fetching Example */}
            <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Data Fetching with Caching</h2>
                <DataFetchingExample />
            </section>

            {/* Table with Search/Filter/Selection */}
            <section className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Advanced Table Management</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create Matter
                    </button>
                </div>
                <MattersTable />
            </section>

            {/* Modal Form */}
            <CreateMatterModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
}