import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../fixtures/test';

/**
 * Accessibility scan, phase 1: REPORT mode.
 * Each key page is scanned against WCAG 2.1 A/AA. Results are attached to the HTML report and
 * summarised as annotations. The test fails only if the scan itself cannot run.
 * Phase 2 will turn this into a gate: fail on any violation not in a reviewed known-issues list.
 */
const pages = [
  { name: 'Products', path: '/inventory.html' },
  { name: 'Cart', path: '/cart.html' },
  { name: 'Checkout: information', path: '/checkout-step-one.html' },
];

test.describe('Accessibility (WCAG 2.1 AA, report mode)', { tag: '@a11y' }, () => {
  for (const target of pages) {
    test(`${target.name} page scan`, async ({ page }, testInfo) => {
      await page.goto(target.path);
      await expect(page.getByTestId('title')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      await testInfo.attach(`axe-${target.name}.json`, {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
      for (const v of results.violations) {
        testInfo.annotations.push({
          type: `a11y:${v.impact ?? 'unknown'}`,
          description: `${v.id} (${v.nodes.length} element(s)): ${v.help}`,
        });
      }

      expect(results.passes.length, 'axe should have evaluated rules on this page').toBeGreaterThan(0);
    });
  }
});
