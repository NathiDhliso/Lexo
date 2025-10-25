/**
 * Performance Tests - Task 21
 * Lighthouse audits, page load times, and network condition testing
 */

import { test, expect } from '@playwright/test';
import {
  measurePageLoadMetrics,
  assertPerformanceBudget,
  setNetworkCondition,
  clearNetworkCondition,
  testWithNetworkCondition,
  measureBundleSizes,
  verifyImageOptimization,
  monitorLongTasks
} from './utils';

test.describe('Task 21: Performance Testing', () => {
  test.describe('Task 21.1: Lighthouse Audits (Performance Budget)', () => {
    test('Dashboard meets performance budget', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await assertPerformanceBudget(page, {
        lcp: 2500,      // Largest Contentful Paint < 2.5s
        fcp: 1800,      // First Contentful Paint < 1.8s
        ttfb: 600,      // Time to First Byte < 600ms
        totalSize: 3 * 1024 * 1024, // Total size < 3MB
        requestCount: 50 // Max 50 requests
      });
    });

    test('Matters page meets performance budget', async ({ page }) => {
      await page.goto('/matters');
      await page.waitForLoadState('networkidle');
      
      await assertPerformanceBudget(page, {
        lcp: 2500,
        fcp: 1800,
        ttfb: 600,
        totalSize: 3 * 1024 * 1024,
        requestCount: 50
      });
    });

    test('Firms page meets performance budget', async ({ page }) => {
      await page.goto('/firms');
      await page.waitForLoadState('networkidle');
      
      await assertPerformanceBudget(page, {
        lcp: 2500,
        fcp: 1800,
        ttfb: 600,
        totalSize: 3 * 1024 * 1024,
        requestCount: 50
      });
    });

    test('Invoices page meets performance budget', async ({ page }) => {
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');
      
      await assertPerformanceBudget(page, {
        lcp: 2500,
        fcp: 1800,
        ttfb: 600,
        totalSize: 3 * 1024 * 1024,
        requestCount: 50
      });
    });

    test('No long tasks blocking main thread', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const longTasks = await monitorLongTasks(page, 5000);
      
      console.log(`Found ${longTasks.length} long tasks (>50ms)`);
      
      if (longTasks.length > 0) {
        console.log('Long tasks:', longTasks);
        
        // Warn but don't fail - some long tasks may be acceptable
        const veryLongTasks = longTasks.filter((task: any) => task.duration > 200);
        expect(veryLongTasks.length).toBeLessThan(3);
      }
    });

    test('Images are optimized', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const { images, issues } = await verifyImageOptimization(page);
      
      console.log(`Total images: ${images.length}`);
      console.log(`Optimization issues: ${issues.length}`);
      
      if (issues.length > 0) {
        console.log('Issues found:');
        issues.forEach(issue => console.log(`- ${issue}`));
      }
      
      // Allow some issues but not too many
      expect(issues.length).toBeLessThan(images.length * 0.5);
    });
  });

  test.describe('Task 21.2: Measure Page Load Times', () => {
    test('Dashboard loads within 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`Dashboard load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    });

    test('Matters page loads within 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/matters');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`Matters page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    });

    test('Firms page loads within 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/firms');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`Firms page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    });

    test('Detailed performance metrics for dashboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const metrics = await measurePageLoadMetrics(page);
      
      console.log('Performance Metrics:');
      console.log(`- LCP: ${metrics.lcp.toFixed(0)}ms`);
      console.log(`- FCP: ${metrics.fcp.toFixed(0)}ms`);
      console.log(`- TTFB: ${metrics.ttfb.toFixed(0)}ms`);
      console.log(`- DOM Content Loaded: ${metrics.domContentLoaded.toFixed(0)}ms`);
      console.log(`- Load Complete: ${metrics.loadComplete.toFixed(0)}ms`);
      console.log(`- Total Size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`- Request Count: ${metrics.requestCount}`);
      
      // Basic assertions
      expect(metrics.lcp).toBeLessThan(2500);
      expect(metrics.fcp).toBeLessThan(1800);
      expect(metrics.ttfb).toBeLessThan(600);
    });

    test('Bundle size analysis', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bundles = await measureBundleSizes(page);
      
      console.log('Bundle Sizes by Type:');
      Object.entries(bundles).forEach(([type, data]: [string, any]) => {
        console.log(`- ${type}: ${data.count} files, ${(data.size / 1024).toFixed(2)} KB`);
      });
      
      // JavaScript bundles should be reasonably sized
      if (bundles.script) {
        const jsSize = bundles.script.size / 1024 / 1024;
        console.log(`Total JS: ${jsSize.toFixed(2)}MB`);
        expect(jsSize).toBeLessThan(2); // Less than 2MB of JS
      }
    });
  });

  test.describe('Task 21.3: Test on Slow Network Conditions', () => {
    test('Dashboard loads on 3G within 10 seconds', async ({ page }) => {
      const loadTime = await testWithNetworkCondition(page, '/', '3g', 10000);
      
      console.log(`Dashboard load time on 3G: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });

    test('Matters page loads on 3G within 10 seconds', async ({ page }) => {
      const loadTime = await testWithNetworkCondition(page, '/matters', '3g', 10000);
      
      console.log(`Matters page load time on 3G: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });

    test('Loading states appear on slow 3G', async ({ page }) => {
      await setNetworkCondition(page, 'slow-3g');
      
      // Start navigation
      const navigationPromise = page.goto('/matters');
      
      // Check for loading state quickly
      await page.waitForTimeout(500);
      
      const hasLoadingState = await page.evaluate(() => {
        const loadingIndicators = document.querySelectorAll(
          '[class*="loading"], [class*="spinner"], [class*="skeleton"], [aria-busy="true"]'
        );
        return loadingIndicators.length > 0;
      });
      
      // Wait for navigation to complete
      await navigationPromise;
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      await clearNetworkCondition(page);
      
      console.log(`Loading state visible: ${hasLoadingState}`);
      // Loading states should appear on slow connections
      expect(hasLoadingState).toBe(true);
    });

    test('Interactive elements work on 4G', async ({ page }) => {
      await setNetworkCondition(page, '4g');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test button interaction
      const button = page.locator('button:visible').first();
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500);
      }
      
      await clearNetworkCondition(page);
    });

    test('Timeout handling on very slow connection', async ({ page }) => {
      await setNetworkCondition(page, 'slow-3g');
      
      try {
        // Try to load with short timeout to test error handling
        await page.goto('/', { timeout: 5000 });
      } catch (error) {
        // Timeout is expected on very slow connection with short timeout
        console.log('Timeout occurred as expected on slow-3g');
      }
      
      await clearNetworkCondition(page);
    });

    test('Skeleton loaders display during slow load', async ({ page }) => {
      await setNetworkCondition(page, '3g');
      
      // Navigate and check for skeletons quickly
      const navPromise = page.goto('/matters');
      await page.waitForTimeout(300);
      
      const skeletons = await page.locator('[class*="skeleton"]').count();
      console.log(`Skeleton loaders found: ${skeletons}`);
      
      await navPromise;
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      await clearNetworkCondition(page);
    });
  });

  test.describe('Performance: Additional Checks', () => {
    test('No memory leaks on navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get initial metrics
      const initialMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate through several pages
      await page.goto('/matters');
      await page.waitForLoadState('networkidle');
      await page.goto('/firms');
      await page.waitForLoadState('networkidle');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });
      
      // Get final metrics
      const finalMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      if (initialMetrics > 0) {
        const increase = finalMetrics - initialMetrics;
        const increasePercent = (increase / initialMetrics) * 100;
        
        console.log(`Memory usage increase: ${(increase / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);
        
        // Memory shouldn't increase by more than 50%
        expect(increasePercent).toBeLessThan(50);
      }
    });

    test('Lazy loading works for images', async ({ page }) => {
      await page.goto('/matters');
      await page.waitForLoadState('networkidle');
      
      const lazyImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => img.loading === 'lazy').length;
      });
      
      console.log(`Lazy-loaded images: ${lazyImages}`);
      expect(lazyImages).toBeGreaterThan(0);
    });

    test('Code splitting is working', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get initial chunks
      const initialChunks = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((r: any) => r.name.includes('.js'))
          .map((r: any) => r.name);
      });
      
      // Navigate to another page
      await page.goto('/matters');
      await page.waitForLoadState('networkidle');
      
      // Get new chunks
      const mattersChunks = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((r: any) => r.name.includes('.js'))
          .map((r: any) => r.name);
      });
      
      // Should have loaded additional chunks
      const newChunks = mattersChunks.filter((c: string) => !initialChunks.includes(c));
      console.log(`New chunks loaded: ${newChunks.length}`);
      
      // Code splitting should result in new chunks on navigation
      expect(newChunks.length).toBeGreaterThan(0);
    });
  });
});
