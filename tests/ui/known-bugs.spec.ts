import { test, expect } from '../../fixtures/test';
import { loginAs } from '../../utils/session';
import { buildCustomer } from '../../utils/testData';

/**
 * Sauce Demo's `problem_user` ships with deliberate defects. These tests describe the CORRECT behaviour
 * and are marked `test.fail()`: they pass while the bug exists and turn red the moment it is fixed,
 * which is the signal to remove the marker. Each bug is documented as a GitHub issue.
 */
test.describe('Known defects: problem_user', { tag: '@known-bug' }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAs(loginPage, inventoryPage, 'problem');
  });

  test('each product shows its own image', async ({ inventoryPage }) => {
    test.info().annotations.push({ type: 'issue', description: 'BUG: problem_user sees the same image for every product' });
    test.fail(true, 'Known defect: every product image is identical for problem_user');

    const sources = await inventoryPage.items.getByRole('img').evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).getAttribute('src')),
    );
    expect(new Set(sources).size).toBe(sources.length);
  });

  test('last name typed at checkout is kept', async ({ inventoryPage, cartPage, checkoutInfoPage }) => {
    test.info().annotations.push({ type: 'issue', description: 'BUG: problem_user cannot enter a last name at checkout' });
    test.fail(true, 'Known defect: the Last Name field does not keep its input for problem_user');

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await cartPage.goto();
    await cartPage.checkoutButton.click();

    const customer = buildCustomer();
    await checkoutInfoPage.enterDetails(customer);

    await expect(checkoutInfoPage.lastName).toHaveValue(customer.lastName, { timeout: 2_000 });
  });
});
