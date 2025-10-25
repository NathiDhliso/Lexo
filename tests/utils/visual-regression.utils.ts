/**
 * Visual Regression Testing Utilities
 * Utilities for capturing and comparing screenshots across breakpoints
 */

import { Page, expect } from '@playwright/test';

/**
 * Standard breakpoints for testing
 */
export const BREAKPOINTS = {
  mobile: { width: 375, height: 667, name: 'mobile' },
  mobileL: { width: 425, height: 812, name: 'mobile-large' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1024, height: 768, name: 'desktop' },
  desktopL: { width: 1440, height: 900, name: 'desktop-large' },
  desktopXL: { width: 1920, height: 1080, name: 'desktop-xl' },
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Screenshot options for consistent captures
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  animations?: 'disabled' | 'allow';
  mask?: string[]; // CSS selectors to mask
  timeout?: number;
}

/**
 * Capture screenshot at specific breakpoint
 */
export async function captureAtBreakpoint(
  page: Page,
  breakpoint: Breakpoint,
  name: string,
  options: ScreenshotOptions = {}
) {
  const { width, height, name: bpName } = BREAKPOINTS[breakpoint];
  
  // Set viewport
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(300); // Allow layout to settle
  
  // Disable animations for consistent screenshots
  if (options.animations === 'disabled') {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }
  
  // Build screenshot name
  const screenshotName = `${name}-${bpName}`;
  
  // Capture screenshot with masking
  const maskSelectors = options.mask?.map(selector => page.locator(selector)) || [];
  
  await expect(page).toHaveScreenshot(`${screenshotName}.png`, {
    fullPage: options.fullPage ?? false,
    animations: options.animations ?? 'disabled',
    mask: maskSelectors,
    timeout: options.timeout ?? 10000,
  });
}

/**
 * Capture screenshots across all breakpoints
 */
export async function captureAcrossBreakpoints(
  page: Page,
  name: string,
  breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop'],
  options: ScreenshotOptions = {}
) {
  for (const breakpoint of breakpoints) {
    await captureAtBreakpoint(page, breakpoint, name, options);
  }
}

/**
 * Capture component screenshot with isolation
 */
export async function captureComponent(
  page: Page,
  selector: string,
  name: string,
  breakpoint: Breakpoint = 'desktop'
) {
  const { width, height } = BREAKPOINTS[breakpoint];
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(300);
  
  const component = page.locator(selector);
  await expect(component).toBeVisible();
  
  await expect(component).toHaveScreenshot(`component-${name}-${BREAKPOINTS[breakpoint].name}.png`, {
    animations: 'disabled',
  });
}

/**
 * Capture hover state screenshot
 */
export async function captureHoverState(
  page: Page,
  selector: string,
  name: string,
  breakpoint: Breakpoint = 'desktop'
) {
  const { width, height } = BREAKPOINTS[breakpoint];
  await page.setViewportSize({ width, height });
  
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  
  // Capture normal state
  await expect(element).toHaveScreenshot(`${name}-normal-${BREAKPOINTS[breakpoint].name}.png`, {
    animations: 'disabled',
  });
  
  // Hover and capture
  await element.hover();
  await page.waitForTimeout(100);
  await expect(element).toHaveScreenshot(`${name}-hover-${BREAKPOINTS[breakpoint].name}.png`, {
    animations: 'disabled',
  });
}

/**
 * Capture focus state screenshot
 */
export async function captureFocusState(
  page: Page,
  selector: string,
  name: string,
  breakpoint: Breakpoint = 'desktop'
) {
  const { width, height } = BREAKPOINTS[breakpoint];
  await page.setViewportSize({ width, height });
  
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  
  // Capture normal state
  await expect(element).toHaveScreenshot(`${name}-unfocused-${BREAKPOINTS[breakpoint].name}.png`, {
    animations: 'disabled',
  });
  
  // Focus and capture
  await element.focus();
  await page.waitForTimeout(100);
  await expect(element).toHaveScreenshot(`${name}-focused-${BREAKPOINTS[breakpoint].name}.png`, {
    animations: 'disabled',
  });
}

/**
 * Capture modal/dialog at different states
 */
export async function captureModal(
  page: Page,
  modalSelector: string,
  name: string,
  breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop']
) {
  const modal = page.locator(modalSelector);
  await expect(modal).toBeVisible();
  
  for (const breakpoint of breakpoints) {
    const { width, height } = BREAKPOINTS[breakpoint];
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot(`modal-${name}-${BREAKPOINTS[breakpoint].name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  }
}

/**
 * Verify no layout shift occurred
 */
export async function verifyNoLayoutShift(
  page: Page,
  selector: string,
  actionFn: () => Promise<void>
) {
  const element = page.locator(selector);
  const beforeBox = await element.boundingBox();
  
  await actionFn();
  await page.waitForTimeout(100);
  
  const afterBox = await element.boundingBox();
  
  expect(beforeBox).toBeTruthy();
  expect(afterBox).toBeTruthy();
  expect(beforeBox!.x).toBe(afterBox!.x);
  expect(beforeBox!.y).toBe(afterBox!.y);
  expect(beforeBox!.width).toBe(afterBox!.width);
  expect(beforeBox!.height).toBe(afterBox!.height);
}

/**
 * Compare element styling across breakpoints
 */
export async function compareStyleAcrossBreakpoints(
  page: Page,
  selector: string,
  property: string,
  breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop']
) {
  const results: Record<string, string> = {};
  
  for (const breakpoint of breakpoints) {
    const { width, height, name } = BREAKPOINTS[breakpoint];
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    
    const element = page.locator(selector);
    const value = await element.evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop);
    }, property);
    
    results[name] = value;
  }
  
  return results;
}
