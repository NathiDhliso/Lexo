/**
 * HelpCenter Component
 * Comprehensive help system with search, video tutorials, and documentation
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Video, 
  Keyboard, 
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Play,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../design-system/components';
import { useHelp } from '../../hooks/useHelp';
import type { HelpArticle } from '../../types/help.types';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearchQuery?: string;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ 
  isOpen, 
  onClose, 
  initialSearchQuery = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const { startTour } = useHelp();

  // Help articles database (in production, load from backend)
  const helpArticles: HelpArticle[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with LexoHub',
      content: 'Learn the basics of LexoHub...',
      category: 'Getting Started',
      tags: ['onboarding', 'basics', 'setup'],
      videoUrl: 'https://youtube.com/watch?v=example1',
      relatedArticles: ['create-first-matter', 'billing-setup'],
      lastUpdated: new Date('2025-01-01'),
      popularity: 100,
    },
    {
      id: 'create-first-matter',
      title: 'Creating Your First Matter',
      content: 'Step-by-step guide to creating a matter...',
      category: 'Matters',
      tags: ['matter', 'create', 'workflow'],
      videoUrl: 'https://youtube.com/watch?v=example2',
      relatedArticles: ['getting-started', 'log-services'],
      lastUpdated: new Date('2025-01-05'),
      popularity: 85,
    },
    {
      id: 'billing-setup',
      title: 'Setting Up Your Billing Preferences',
      content: 'Configure how you bill clients...',
      category: 'Billing',
      tags: ['billing', 'setup', 'preferences'],
      videoUrl: 'https://youtube.com/watch?v=example3',
      relatedArticles: ['generate-invoice'],
      lastUpdated: new Date('2025-01-10'),
      popularity: 92,
    },
    {
      id: 'log-services',
      title: 'Logging Services and Time Entries',
      content: 'Track your billable time...',
      category: 'Time Tracking',
      tags: ['time', 'services', 'billing'],
      relatedArticles: ['create-first-matter', 'generate-invoice'],
      lastUpdated: new Date('2025-01-12'),
      popularity: 78,
    },
    {
      id: 'generate-invoice',
      title: 'Generating Professional Invoices',
      content: 'Create and send invoices to clients...',
      category: 'Invoices',
      tags: ['invoice', 'billing', 'payment'],
      videoUrl: 'https://youtube.com/watch?v=example4',
      relatedArticles: ['log-services', 'billing-setup'],
      lastUpdated: new Date('2025-01-15'),
      popularity: 95,
    },
    {
      id: 'document-linking',
      title: 'Linking Cloud Documents',
      content: 'Connect your cloud storage to matters...',
      category: 'Documents',
      tags: ['documents', 'cloud', 'storage'],
      relatedArticles: ['create-first-matter'],
      lastUpdated: new Date('2025-01-18'),
      popularity: 65,
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts Guide',
      content: 'Master keyboard shortcuts for efficiency...',
      category: 'Tips & Tricks',
      tags: ['shortcuts', 'productivity', 'keyboard'],
      relatedArticles: [],
      lastUpdated: new Date('2025-01-20'),
      popularity: 55,
    },
    {
      id: 'proforma-workflow',
      title: 'Pro Forma Request Workflow',
      content: 'How to request and approve pro formas...',
      category: 'Pro Forma',
      tags: ['proforma', 'approval', 'workflow'],
      videoUrl: 'https://youtube.com/watch?v=example5',
      relatedArticles: ['create-first-matter', 'attorney-connection'],
      lastUpdated: new Date('2025-01-22'),
      popularity: 70,
    },
  ];

  // Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    helpArticles.forEach(article => cats.add(article.category));
    return ['all', ...Array.from(cats)];
  }, [helpArticles]);

  // Filter and search articles
  const filteredArticles = useMemo(() => {
    let results = helpArticles;

    // Filter by category
    if (activeCategory !== 'all') {
      results = results.filter(article => article.category === activeCategory);
    }

    // Search by query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by popularity
    return results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [activeCategory, searchQuery, helpArticles]);

  // Quick actions
  const quickActions = [
    {
      icon: Play,
      title: 'Start Interactive Tour',
      description: 'Guided walkthrough of key features',
      action: () => {
        startTour('dashboard-overview');
        onClose();
      },
    },
    {
      icon: Keyboard,
      title: 'Keyboard Shortcuts',
      description: 'Learn productivity shortcuts',
      action: () => setSelectedArticle(helpArticles.find(a => a.id === 'keyboard-shortcuts') || null),
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      action: () => setActiveCategory('all'),
    },
    {
      icon: MessageCircle,
      title: 'Contact Support',
      description: 'Get help from our team',
      action: () => window.open('mailto:support@lexohub.com', '_blank'),
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[90vh] bg-white dark:bg-metallic-gray-900 rounded-lg shadow-2xl border border-neutral-200 dark:border-metallic-gray-700 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-center-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700 bg-gradient-to-r from-judicial-blue-600 to-judicial-blue-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="help-center-title" className="text-2xl font-bold text-white">
                Help Center
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Find answers, watch tutorials, and get support
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/10"
            aria-label="Close help center"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-neutral-200 dark:border-metallic-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedArticle(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === category
                      ? 'bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-700 dark:text-judicial-blue-300 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 hover:border-judicial-blue-400 dark:hover:border-judicial-blue-600 hover:bg-judicial-blue-50 dark:hover:bg-judicial-blue-900/20 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <action.icon className="w-4 h-4 text-judicial-blue-600 dark:text-judicial-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {action.title}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                  autoFocus
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedArticle ? (
                /* Article Detail View */
                <div className="max-w-3xl">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-sm text-judicial-blue-600 dark:text-judicial-blue-400 hover:underline mb-4"
                  >
                    ← Back to results
                  </button>

                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {selectedArticle.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    <span>{selectedArticle.category}</span>
                    <span>•</span>
                    <span>Updated {selectedArticle.lastUpdated.toLocaleDateString()}</span>
                  </div>

                  {selectedArticle.videoUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-neutral-200 dark:border-metallic-gray-700">
                      <div className="aspect-video bg-neutral-900 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white opacity-75" />
                      </div>
                    </div>
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    {selectedArticle.content}
                  </div>

                  {selectedArticle.relatedArticles && selectedArticle.relatedArticles.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-metallic-gray-700">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                        Related Articles
                      </h3>
                      <div className="space-y-2">
                        {selectedArticle.relatedArticles.map(relatedId => {
                          const related = helpArticles.find(a => a.id === relatedId);
                          return related ? (
                            <button
                              key={related.id}
                              onClick={() => setSelectedArticle(related)}
                              className="flex items-center gap-2 text-judicial-blue-600 dark:text-judicial-blue-400 hover:underline"
                            >
                              <ChevronRight className="w-4 h-4" />
                              {related.title}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Article List View */
                <div>
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        No articles found
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Try adjusting your search or browse categories
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredArticles.map(article => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="text-left p-5 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 hover:border-judicial-blue-400 dark:hover:border-judicial-blue-600 hover:bg-judicial-blue-50 dark:hover:bg-judicial-blue-900/20 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {article.videoUrl && (
                                  <Video className="w-4 h-4 text-judicial-blue-600 dark:text-judicial-blue-400 flex-shrink-0" />
                                )}
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-judicial-blue-700 dark:group-hover:text-judicial-blue-300">
                                  {article.title}
                                </h3>
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                                {article.content}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {article.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-600 dark:text-neutral-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-judicial-blue-600 dark:group-hover:text-judicial-blue-400 flex-shrink-0 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="text-neutral-600 dark:text-neutral-400">
              Press <kbd className="px-2 py-1 bg-white dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded font-mono">?</kbd> anytime to open help
            </div>
            <a
              href="mailto:support@lexohub.com"
              className="flex items-center gap-2 text-judicial-blue-600 dark:text-judicial-blue-400 hover:underline"
            >
              Contact Support <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
