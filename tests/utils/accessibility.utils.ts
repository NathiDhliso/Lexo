/**
 * Accessibility Testing Utilities
 * Utilities for testing WCAG compliance, keyboard navigation, and screen reader support
 */

import { Page, expect } from '@playwright/test';

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * Accessibility violation severity
 */
export type ViolationImpact = 'minor' | 'moderate' | 'serious' | 'critical';

/**
 * Accessibility scan result
 */
export interface AccessibilityScanResult {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  timestamp: Date;
}

/**
 * Individual violation
 */
export interface AccessibilityViolation {
  id: string;
  impact: ViolationImpact;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

/**
 * Inject axe-core into the page
 * Note: axe-core needs to be installed via npm
 */
export async function injectAxe(page: Page) {
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
  });
}

/**
 * Run accessibility scan with axe-core
 */
export async function runAccessibilityScan(
  page: Page,
  options: {
    wcagLevel?: WCAGLevel;
    rules?: string[];
    selector?: string;
  } = {}
): Promise<AccessibilityScanResult> {
  // Inject axe if not already present
  const hasAxe = await page.evaluate(() => typeof (window as any).axe !== 'undefined');
  if (!hasAxe) {
    await injectAxe(page);
  }
  
  // Build axe config
  const axeConfig: any = {
    runOnly: {
      type: 'tag',
      values: [`wcag2${options.wcagLevel?.toLowerCase() || 'aa'}`, 'best-practice']
    }
  };
  
  if (options.rules) {
    axeConfig.rules = options.rules.reduce((acc: any, rule: string) => {
      acc[rule] = { enabled: true };
      return acc;
    }, {});
  }
  
  // Run axe scan
  const results = await page.evaluate((config) => {
    return (window as any).axe.run(config);
  }, axeConfig);
  
  return {
    violations: results.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary
      }))
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    timestamp: new Date()
  };
}

/**
 * Assert no critical accessibility violations
 */
export async function assertNoA11yViolations(
  page: Page,
  options?: {
    wcagLevel?: WCAGLevel;
    allowedImpacts?: ViolationImpact[];
  }
) {
  const results = await runAccessibilityScan(page, { wcagLevel: options?.wcagLevel });
  
  const allowedImpacts = options?.allowedImpacts || [];
  const criticalViolations = results.violations.filter(
    v => !allowedImpacts.includes(v.impact)
  );
  
  if (criticalViolations.length > 0) {
    const violationSummary = criticalViolations.map(v => 
      `\n- [${v.impact.toUpperCase()}] ${v.id}: ${v.description}\n  ${v.helpUrl}\n  Affected: ${v.nodes.length} element(s)`
    ).join('\n');
    
    throw new Error(
      `Found ${criticalViolations.length} accessibility violation(s):${violationSummary}`
    );
  }
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(
  page: Page,
  expectedOrder: string[]
) {
  const focusedElements: string[] = [];
  
  // Tab through elements
  for (let i = 0; i < expectedOrder.length; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('data-testid') || 
             el?.getAttribute('aria-label') || 
             el?.tagName.toLowerCase();
    });
    
    focusedElements.push(focused || 'unknown');
  }
  
  return focusedElements;
}

/**
 * Verify focus indicators are visible
 */
export async function verifyFocusIndicator(
  page: Page,
  selector: string,
  minContrastRatio: number = 3
) {
  const element = page.locator(selector);
  await element.focus();
  await page.waitForTimeout(100);
  
  const hasOutline = await element.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return (
      style.outline !== 'none' &&
      style.outlineWidth !== '0px' &&
      parseInt(style.outlineWidth) > 0
    ) || (
      style.boxShadow !== 'none' &&
      style.boxShadow.length > 0
    );
  });
  
  expect(hasOutline).toBe(true);
}

/**
 * Test ARIA attributes
 */
export async function verifyAriaAttributes(
  page: Page,
  selector: string,
  expectedAttributes: Record<string, string | boolean>
) {
  const element = page.locator(selector);
  
  for (const [attr, expectedValue] of Object.entries(expectedAttributes)) {
    const actualValue = await element.getAttribute(attr);
    
    if (typeof expectedValue === 'boolean') {
      if (expectedValue) {
        expect(actualValue).not.toBeNull();
      } else {
        expect(actualValue).toBeNull();
      }
    } else {
      expect(actualValue).toBe(expectedValue);
    }
  }
}

/**
 * Verify all images have alt text
 */
export async function verifyImageAltText(page: Page) {
  const imagesWithoutAlt = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images
      .filter(img => !img.alt && img.getAttribute('role') !== 'presentation')
      .map(img => img.outerHTML.substring(0, 100));
  });
  
  expect(imagesWithoutAlt).toHaveLength(0);
}

/**
 * Verify form labels
 */
export async function verifyFormLabels(page: Page) {
  const inputsWithoutLabels = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    return inputs
      .filter(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
        return !hasLabel && !hasAriaLabel;
      })
      .map(input => input.outerHTML.substring(0, 100));
  });
  
  expect(inputsWithoutLabels).toHaveLength(0);
}

/**
 * Test color contrast
 */
export async function verifyColorContrast(
  page: Page,
  selector: string,
  minRatio: number = 4.5
) {
  const contrastRatio = await page.locator(selector).evaluate((el, minR) => {
    const style = window.getComputedStyle(el);
    const color = style.color;
    const bgColor = style.backgroundColor;
    
    // Parse RGB values
    const parseRgb = (rgb: string) => {
      const match = rgb.match(/\d+/g);
      return match ? match.map(Number) : [0, 0, 0];
    };
    
    const [r1, g1, b1] = parseRgb(color);
    const [r2, g2, b2] = parseRgb(bgColor);
    
    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(r1, g1, b1);
    const l2 = getLuminance(r2, g2, b2);
    
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return ratio;
  }, minRatio);
  
  expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
}

/**
 * Test heading hierarchy
 */
export async function verifyHeadingHierarchy(page: Page) {
  const headings = await page.evaluate(() => {
    const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headingElements.map(h => ({
      tag: h.tagName.toLowerCase(),
      level: parseInt(h.tagName.substring(1)),
      text: h.textContent?.trim()
    }));
  });
  
  let previousLevel = 0;
  for (const heading of headings) {
    // Check that heading levels don't skip (e.g., h1 -> h3)
    if (heading.level > previousLevel + 1) {
      throw new Error(
        `Heading hierarchy violation: ${heading.tag} follows h${previousLevel}. Expected h${previousLevel + 1}.`
      );
    }
    previousLevel = heading.level;
  }
  
  return headings;
}

/**
 * Verify touch targets meet minimum size (44x44px)
 */
export async function verifyTouchTargets(
  page: Page,
  minSize: number = 44
) {
  const smallTargets = await page.evaluate((min) => {
    const interactiveElements = Array.from(
      document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')
    );
    
    return interactiveElements
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width < min || rect.height < min;
      })
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 50),
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height
      }));
  }, minSize);
  
  if (smallTargets.length > 0) {
    console.warn(`Found ${smallTargets.length} touch targets smaller than ${minSize}x${minSize}px:`, smallTargets);
  }
  
  return smallTargets;
}

/**
 * Test screen reader announcements
 */
export async function verifyLiveRegion(
  page: Page,
  selector: string,
  expectedAnnouncement: string
) {
  const element = page.locator(selector);
  const ariaLive = await element.getAttribute('aria-live');
  const role = await element.getAttribute('role');
  
  expect(ariaLive || role).toBeTruthy();
  
  const text = await element.textContent();
  expect(text).toContain(expectedAnnouncement);
}
