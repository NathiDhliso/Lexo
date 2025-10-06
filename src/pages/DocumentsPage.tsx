import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, Search, File, FileText, Download, Trash2, Eye, Filter, Grid, List } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../types';

interface DocumentsPageProps {
  onNavigate?: (page: Page) => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  matterId?: string;
  matterTitle?: string;
  category: 'pleading' | 'evidence' | 'correspondence' | 'contract' | 'other';
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments([]);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category: Document['category']) => {
    switch (category) {
      case 'pleading':
        return 'bg-judicial-blue-100 text-judicial-blue-800';
      case 'evidence':
        return 'bg-mpondo-gold-100 text-mpondo-gold-800';
      case 'correspondence':
        return 'bg-status-info-100 text-status-info-800';
      case 'contract':
        return 'bg-status-success-100 text-status-success-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.matterTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Documents', count: documents.length },
    { id: 'pleading', label: 'Pleadings', count: documents.filter(d => d.category === 'pleading').length },
    { id: 'evidence', label: 'Evidence', count: documents.filter(d => d.category === 'evidence').length },
    { id: 'correspondence', label: 'Correspondence', count: documents.filter(d => d.category === 'correspondence').length },
    { id: 'contract', label: 'Contracts', count: documents.filter(d => d.category === 'contract').length },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Documents</h1>
          <p className="text-neutral-600 mt-1">Manage your legal documents and files</p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          <Icon icon={Upload} className="w-4 h-4 mr-2" noGradient />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={File} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">{documents.length}</h3>
            <p className="text-sm text-neutral-600">Total Documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={FileText} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">
              {documents.filter(d => d.category === 'pleading').length}
            </h3>
            <p className="text-sm text-neutral-600">Pleadings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={FolderOpen} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">
              {documents.filter(d => d.category === 'evidence').length}
            </h3>
            <p className="text-sm text-neutral-600">Evidence Files</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Icon icon={Upload} className="w-6 h-6 mx-auto" noGradient />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">0</h3>
            <p className="text-sm text-neutral-600">Uploaded This Week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Categories</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-mpondo-gold-100 text-mpondo-gold-800'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-xs bg-neutral-200 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-neutral-900">Document Library</h2>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500"
                  />
                </div>
                <div className="flex items-center gap-1 border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-l-lg ${
                      viewMode === 'list' ? 'bg-mpondo-gold-100 text-mpondo-gold-800' : 'text-neutral-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-r-lg ${
                      viewMode === 'grid' ? 'bg-mpondo-gold-100 text-mpondo-gold-800' : 'text-neutral-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  <Icon icon={Filter} className="w-4 h-4 mr-2" noGradient />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-2'}>
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`${
                      viewMode === 'grid'
                        ? 'p-4 border border-neutral-200 rounded-lg hover:border-mpondo-gold-500 cursor-pointer transition-colors'
                        : 'flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-mpondo-gold-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-mpondo-gold-600" />
                        </div>
                        <h4 className="font-medium text-neutral-900 text-sm mb-1 truncate">{doc.name}</h4>
                        <p className="text-xs text-neutral-600">{formatFileSize(doc.size)}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                          {doc.category}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-mpondo-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-mpondo-gold-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 truncate">{doc.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-neutral-600">{formatFileSize(doc.size)}</span>
                              <span className="text-xs text-neutral-400">•</span>
                              <span className="text-xs text-neutral-600">
                                {doc.uploadedAt.toLocaleDateString()}
                              </span>
                              {doc.matterTitle && (
                                <>
                                  <span className="text-xs text-neutral-400">•</span>
                                  <span className="text-xs text-neutral-600 truncate">{doc.matterTitle}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                            {doc.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Icon icon={Eye} className="w-4 h-4" noGradient />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon icon={Download} className="w-4 h-4" noGradient />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon icon={Trash2} className="w-4 h-4 text-status-error-600" noGradient />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon icon={FolderOpen} className="w-16 h-16 mx-auto mb-4 text-neutral-300" noGradient />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No documents yet</h3>
                <p className="text-neutral-600 mb-4">
                  Upload your first document to get started with document management
                </p>
                <Button variant="primary" onClick={() => {}}>
                  <Icon icon={Upload} className="w-4 h-4 mr-2" noGradient />
                  Upload Your First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentsPage;
