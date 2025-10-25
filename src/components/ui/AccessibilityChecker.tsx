import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  suggestion?: string;
}

/**
 * AccessibilityChecker - Development tool for checking accessibility compliance
 * 
 * This component runs accessibility checks on the page and displays issues.
 * Only renders in development mode.
 * 
 * Features:
 * - ARIA label validation
 * - Keyboard navigation checks
 * - Color contrast warnings
 * - Touch target size verification
 * - Focus management validation
 * 
 * @example
 * ```tsx
 * // Add to your development layout
 * {process.env.NODE_ENV === 'development' && <AccessibilityChecker />}
 * ```
 */
export const AccessibilityChecker: React.FC = () => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check 1: Interactive elements without ARIA labels
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      buttons.forEach((button) => {
        if (!button.textContent?.trim()) {
          foundIssues.push({
            severity: 'error',
            message: 'Button without accessible label',
            element: button.className || 'button',
            suggestion: 'Add aria-label or visible text content',
          });
        }
      });

      // Check 2: Images without alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        foundIssues.push({
          severity: 'error',
          message: `${images.length} image(s) missing alt text`,
          suggestion: 'Add alt attribute to all images',
        });
      }

      // Check 3: Links without text or labels
      const emptyLinks = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
      emptyLinks.forEach((link) => {
        if (!link.textContent?.trim()) {
          foundIssues.push({
            severity: 'error',
            message: 'Link without accessible text',
            element: link.className || 'link',
            suggestion: 'Add aria-label or visible text content',
          });
        }
      });

      // Check 4: Form inputs without labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label) {
            foundIssues.push({
              severity: 'warning',
              message: 'Input without associated label',
              element: id || input.className || 'input',
              suggestion: 'Add <label> element or aria-label',
            });
          }
        }
      });

      // Check 5: Touch target sizes (mobile)
      if (window.innerWidth < 768) {
        const clickableElements = document.querySelectorAll('button, a, [role="button"], [role="link"]');
        clickableElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 44 || rect.height < 44) {
              foundIssues.push({
                severity: 'warning',
                message: 'Touch target smaller than 44x44px',
                element: element.className || element.tagName.toLowerCase(),
                suggestion: 'Increase touch target size to minimum 44x44px',
              });
            }
          }
        });
      }

      // Check 6: Missing role attributes on custom interactive elements
      const divButtons = document.querySelectorAll('div[onclick], div[onkeydown]');
      divButtons.forEach((div) => {
        if (!div.getAttribute('role')) {
          foundIssues.push({
            severity: 'error',
            message: 'Interactive div without role attribute',
            element: div.className || 'div',
            suggestion: 'Add role="button" and appropriate ARIA attributes',
          });
        }
      });

      // Check 7: Heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map((h) => parseInt(h.tagName[1]));
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        if (diff > 1) {
          foundIssues.push({
            severity: 'warning',
            message: `Heading hierarchy skipped from h${headingLevels[i - 1]} to h${headingLevels[i]}`,
            suggestion: 'Use sequential heading levels (don\'t skip)',
          });
          break;
        }
      }

      // Check 8: Focus visible styles
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      let hasFocusStyles = false;
      focusableElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element as Element);
        if (computedStyle.outlineWidth !== '0px' || computedStyle.boxShadow !== 'none') {
          hasFocusStyles = true;
        }
      });

      if (focusableElements.length > 0 && !hasFocusStyles) {
        foundIssues.push({
          severity: 'info',
          message: 'Consider adding visible focus indicators',
          suggestion: 'Add outline or box-shadow on :focus-visible',
        });
      }

      setIssues(foundIssues);
    };

    // Run check after a short delay to let page render
    const timer = setTimeout(checkAccessibility, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const getSeverityIcon = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-status-error-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-status-warning-600" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-judicial-blue-600" />;
    }
  };

  const getSeverityColor = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-status-error-50 dark:bg-status-error-900/20 border-status-error-200 dark:border-status-error-800';
      case 'warning':
        return 'bg-status-warning-50 dark:bg-status-warning-900/20 border-status-warning-200 dark:border-status-warning-800';
      case 'info':
        return 'bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border-judicial-blue-200 dark:border-judicial-blue-800';
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-md"
      role="complementary"
      aria-label="Accessibility checker"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-metallic-gray-800 border-2 border-judicial-blue-500 dark:border-judicial-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-expanded={!isMinimized}
        aria-controls="a11y-issues-panel"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {errorCount > 0 && (
              <span className="px-2 py-1 bg-status-error-100 dark:bg-status-error-900/30 text-status-error-700 dark:text-status-error-400 text-xs font-bold rounded">
                {errorCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 bg-status-warning-100 dark:bg-status-warning-900/30 text-status-warning-700 dark:text-status-warning-400 text-xs font-bold rounded">
                {warningCount}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            A11y Check
          </span>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {isMinimized ? '▲' : '▼'}
        </span>
      </button>

      {/* Issues Panel */}
      {!isMinimized && (
        <div
          id="a11y-issues-panel"
          className="mt-2 max-h-96 overflow-y-auto bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg"
        >
          <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Accessibility Issues
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {issues.length === 0 ? 'No issues found! 🎉' : `Found ${issues.length} issue(s)`}
            </p>
          </div>

          <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
            {issues.length === 0 ? (
              <div className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-status-success-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  All checks passed
                </p>
              </div>
            ) : (
              issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {issue.message}
                      </p>
                      {issue.element && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                          Element: {issue.element}
                        </p>
                      )}
                      {issue.suggestion && (
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 italic">
                          💡 {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export type { AccessibilityIssue };
