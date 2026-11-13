import { test, expect } from '../../fixtures/test';
import { loginAs } from '../../utils/session';
import { buildCustomer, roundToCents } from '../../utils/testData';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

// Sauce Demo applies a flat 8% tax. Kept as a named constant so a pricing change is a one-line fix.
const TAX_RATE = 0.08;

test.describe('Checkout', () => {
  test.beforeEach(async ({ loginPage, inventoryPage, cartPage }) => {
    await loginAs(loginPage, inventoryPage);
    await inventoryPage.addToCart(BACKPACK);
    await cartPage.goto();
    await cartPage.checkoutButton.click();
  });

  test.describe('customer information validation', { tag: '@regression' }, () => {
    const cases = [
      { field: 'first name', overrides: { firstName: '' }, message: 'First Name is required' },
      { field: 'last name', overrides: { lastName: '' }, message: 'Last Name is required' },
      { field: 'postal code', overrides: { postalCode: '' }, message: 'Postal Code is required' },
    ];

    for (const c of cases) {
      test(`blocks checkout when ${c.field} is missing`, async ({ checkoutInfoPage }) => {
        await checkoutInfoPage.submit(buildCustomer(c.overrides));

        await checkoutInfoPage.expectError(c.message);
        await checkoutInfoPage.expectLoaded();
      });
    }
  });

  test('cancel on the information step returns to the cart', { tag: '@regression' }, async ({
    checkoutInfoPage,
    cartPage,
  }) => {
    await checkoutInfoPage.cancelButton.click();
    await cartPage.expectLoaded();
  });

  test('cancel on the overview step keeps the cart and returns to products', { tag: '@regression' }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
    inventoryPage,
  }) => {
    await checkoutInfoPage.submit(buildCustomer());
    await checkoutOverviewPage.expectLoaded();

    await checkoutOverviewPage.cancelButton.click();

    await inventoryPage.expectLoaded();
    await inventoryPage.expectCartCount(1);
  });
});

test.describe('End-to-end purchase', () => {
  test('a customer can buy several items with correct totals', { tag: ['@smoke', '@e2e'] }, async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await test.step('log in and pick products after sorting by price', async () => {
      await loginAs(loginPage, inventoryPage);
      await inventoryPage.sortBy('lohi');
      for (const name of [BACKPACK, BIKE_LIGHT, ONESIE]) {
        await inventoryPage.addToCart(name);
      }
      await inventoryPage.expectCartCount(3);
    });

    await test.step('review the cart', async () => {
      await inventoryPage.cartLink.click();
      await cartPage.expectLoaded();
      await expect(cartPage.items).toHaveCount(3);
      await cartPage.checkoutButton.click();
    });

    await test.step('enter customer details', async () => {
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.submit(buildCustomer());
    });

    await test.step('verify the price summary is calculated correctly', async () => {
      await checkoutOverviewPage.expectLoaded();
      const itemPrices = await checkoutOverviewPage.prices();
      const { subtotal, tax, total } = await checkoutOverviewPage.summary();

      const expectedSubtotal = roundToCents(itemPrices.reduce((sum, p) => sum + p, 0));
      const expectedTax = roundToCents(expectedSubtotal * TAX_RATE);

      expect(subtotal).toBe(expectedSubtotal);
      expect(tax).toBe(expectedTax);
      expect(total).toBe(roundToCents(expectedSubtotal + expectedTax));

      await checkoutOverviewPage.finishButton.click();
    });

    await test.step('order is confirmed and the cart is emptied', async () => {
      await checkoutCompletePage.expectLoaded();
      await inventoryPage.expectCartCount(0);

      await checkoutCompletePage.backHomeButton.click();
      await inventoryPage.expectLoaded();
    });
  });
});
