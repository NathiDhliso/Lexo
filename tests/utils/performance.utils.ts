/**
 * Performance Testing Utilities
 * Utilities for Lighthouse audits, load time measurements, and network simulation
 */

import { Page, expect } from '@playwright/test';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // Additional metrics
  domContentLoaded: number;
  loadComplete: number;
  totalSize: number; // bytes
  requestCount: number;
  
  // Lighthouse scores (0-100)
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
}

/**
 * Network conditions for throttling
 */
export const NETWORK_CONDITIONS = {
  '4g': {
    downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8,   // 3 Mbps
    latency: 20, // ms
  },
  '3g': {
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8,          // 750 Kbps
    latency: 150, // ms
  },
  'slow-3g': {
    downloadThroughput: 500 * 1024 / 8,  // 500 Kbps
    uploadThroughput: 500 * 1024 / 8,    // 500 Kbps
    latency: 400, // ms
  },
  offline: {
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0,
  }
} as const;

export type NetworkCondition = keyof typeof NETWORK_CONDITIONS;

/**
 * Measure page load performance metrics
 */
export async function measurePageLoadMetrics(page: Page): Promise<PerformanceMetrics> {
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    // Calculate metrics
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = performance.getEntriesByType('largest-contentful-paint')?.[0]?.startTime || 0;
    
    return {
      lcp,
      fid: 0, // FID can only be measured with user interaction
      cls: 0, // CLS requires specialized measurement
      fcp,
      ttfb: perfData.responseStart - perfData.requestStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalSize: 0, // Will be calculated from resources
      requestCount: performance.getEntriesByType('resource').length
    };
  });
  
  // Get resource sizes
  const resources = await page.evaluate(() => {
    return performance.getEntriesByType('resource').map((r: any) => ({
      size: r.transferSize || r.decodedBodySize || 0,
      type: r.initiatorType
    }));
  });
  
  metrics.totalSize = resources.reduce((sum, r) => sum + r.size, 0);
  
  return metrics;
}

/**
 * Measure Core Web Vitals
 */
export async function measureCoreWebVitals(page: Page) {
  // Inject web-vitals library
  await page.addScriptTag({
    url: 'https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js'
  });
  
  // Collect metrics
  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics: any = {};
      
      (window as any).webVitals.onLCP((metric: any) => {
        metrics.lcp = metric.value;
      });
      
      (window as any).webVitals.onFID((metric: any) => {
        metrics.fid = metric.value;
      });
      
      (window as any).webVitals.onCLS((metric: any) => {
        metrics.cls = metric.value;
      });
      
      (window as any).webVitals.onFCP((metric: any) => {
        metrics.fcp = metric.value;
      });
      
      (window as any).webVitals.onTTFB((metric: any) => {
        metrics.ttfb = metric.value;
      });
      
      // Give time for metrics to be collected
      setTimeout(() => resolve(metrics), 3000);
    });
  });
  
  return vitals;
}

/**
 * Set network throttling
 */
export async function setNetworkCondition(page: Page, condition: NetworkCondition) {
  const client = await (page.context() as any).newCDPSession(page);
  
  if (condition === 'offline') {
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });
  } else {
    const config = NETWORK_CONDITIONS[condition];
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      ...config,
    });
  }
}

/**
 * Clear network throttling
 */
export async function clearNetworkCondition(page: Page) {
  const client = await (page.context() as any).newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
}

/**
 * Test page load with network throttling
 */
export async function testWithNetworkCondition(
  page: Page,
  url: string,
  condition: NetworkCondition,
  maxLoadTime: number = 10000
) {
  await setNetworkCondition(page, condition);
  
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle', { timeout: maxLoadTime });
  const loadTime = Date.now() - startTime;
  
  await clearNetworkCondition(page);
  
  return loadTime;
}

/**
 * Assert performance budget
 */
export async function assertPerformanceBudget(
  page: Page,
  budget: {
    lcp?: number;
    fcp?: number;
    ttfb?: number;
    totalSize?: number;
    requestCount?: number;
  }
) {
  const metrics = await measurePageLoadMetrics(page);
  
  const violations: string[] = [];
  
  if (budget.lcp && metrics.lcp > budget.lcp) {
    violations.push(`LCP: ${metrics.lcp.toFixed(0)}ms (budget: ${budget.lcp}ms)`);
  }
  
  if (budget.fcp && metrics.fcp > budget.fcp) {
    violations.push(`FCP: ${metrics.fcp.toFixed(0)}ms (budget: ${budget.fcp}ms)`);
  }
  
  if (budget.ttfb && metrics.ttfb > budget.ttfb) {
    violations.push(`TTFB: ${metrics.ttfb.toFixed(0)}ms (budget: ${budget.ttfb}ms)`);
  }
  
  if (budget.totalSize && metrics.totalSize > budget.totalSize) {
    const sizeMB = (metrics.totalSize / 1024 / 1024).toFixed(2);
    const budgetMB = (budget.totalSize / 1024 / 1024).toFixed(2);
    violations.push(`Total Size: ${sizeMB}MB (budget: ${budgetMB}MB)`);
  }
  
  if (budget.requestCount && metrics.requestCount > budget.requestCount) {
    violations.push(`Requests: ${metrics.requestCount} (budget: ${budget.requestCount})`);
  }
  
  if (violations.length > 0) {
    throw new Error(
      `Performance budget violations:\n${violations.map(v => `- ${v}`).join('\n')}`
    );
  }
}

/**
 * Measure time to interactive
 */
export async function measureTimeToInteractive(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(0);
      } else {
        const startTime = performance.now();
        window.addEventListener('load', () => {
          resolve(performance.now() - startTime);
        });
      }
    });
  });
}

/**
 * Monitor long tasks (>50ms)
 */
export async function monitorLongTasks(page: Page, duration: number = 5000) {
  // Start performance observer
  await page.evaluate((dur) => {
    (window as any).__longTasks = [];
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        (window as any).__longTasks.push({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    });
    
    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
    
    setTimeout(() => observer.disconnect(), dur);
  }, duration);
  
  // Wait for monitoring period
  await page.waitForTimeout(duration);
  
  // Get collected long tasks
  const longTasks = await page.evaluate(() => (window as any).__longTasks || []);
  return longTasks;
}

/**
 * Measure bundle sizes by resource type
 */
export async function measureBundleSizes(page: Page) {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const byType: Record<string, { count: number; size: number }> = {};
    
    entries.forEach(entry => {
      const type = entry.initiatorType || 'other';
      if (!byType[type]) {
        byType[type] = { count: 0, size: 0 };
      }
      byType[type].count++;
      byType[type].size += entry.transferSize || entry.decodedBodySize || 0;
    });
    
    return byType;
  });
  
  return resources;
}

/**
 * Test with CPU throttling
 */
export async function setCPUThrottling(page: Page, multiplier: number = 4) {
  const client = await (page.context() as any).newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: multiplier });
}

/**
 * Clear CPU throttling
 */
export async function clearCPUThrottling(page: Page) {
  const client = await (page.context() as any).newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
}

/**
 * Verify images are optimized (correct format, size, compression)
 */
export async function verifyImageOptimization(page: Page) {
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    
    return imgs.map(img => ({
      src: img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
      displayWidth: img.width,
      displayHeight: img.height,
      loading: img.loading,
      format: img.src.split('.').pop()?.split('?')[0]
    }));
  });
  
  const issues: string[] = [];
  
  images.forEach(img => {
    // Check for lazy loading
    if (img.loading !== 'lazy' && !img.src.includes('logo')) {
      issues.push(`Image ${img.src.substring(0, 50)} should use lazy loading`);
    }
    
    // Check for oversized images (rendered at <50% of natural size)
    const sizeRatio = (img.displayWidth * img.displayHeight) / (img.width * img.height);
    if (sizeRatio < 0.5) {
      issues.push(`Image ${img.src.substring(0, 50)} is oversized (${img.width}x${img.height} rendered at ${img.displayWidth}x${img.displayHeight})`);
    }
    
    // Check for modern formats (webp, avif)
    if (img.format && !['webp', 'avif', 'svg'].includes(img.format)) {
      issues.push(`Image ${img.src.substring(0, 50)} should use modern format (webp/avif)`);
    }
  });
  
  return { images, issues };
}
