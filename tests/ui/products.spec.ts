import { test, expect } from '../../fixtures/test';
import { loginAs } from '../../utils/session';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

test.describe('Products page', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAs(loginPage, inventoryPage);
  });

  test('lists 6 products, each with a name, price and image', { tag: '@smoke' }, async ({
    inventoryPage,
  }) => {
    await expect(inventoryPage.items).toHaveCount(6);

    for (const item of await inventoryPage.items.all()) {
      await expect(item.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(item.getByRole('img')).toBeVisible();
    }
  });

  test.describe('sorting', { tag: '@regression' }, () => {
    // Expected order is computed from the page's own data, not hard-coded,
    // so the tests stay valid if the catalogue changes.
    test('Name (A to Z)', async ({ inventoryPage }) => {
      await inventoryPage.sortBy('az');
      const names = await inventoryPage.names();
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    test('Name (Z to A)', async ({ inventoryPage }) => {
      await inventoryPage.sortBy('za');
      const names = await inventoryPage.names();
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    });

    test('Price (low to high)', async ({ inventoryPage }) => {
      await inventoryPage.sortBy('lohi');
      const prices = await inventoryPage.prices();
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('Price (high to low)', async ({ inventoryPage }) => {
      await inventoryPage.sortBy('hilo');
      const prices = await inventoryPage.prices();
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
  });

  test('adding and removing items keeps the cart badge in sync', { tag: '@smoke' }, async ({
    inventoryPage,
  }) => {
    await inventoryPage.expectCartCount(0);

    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(BIKE_LIGHT);
    await inventoryPage.addToCart(ONESIE);
    await inventoryPage.expectCartCount(3);

    await inventoryPage.removeFromCart(BIKE_LIGHT);
    await inventoryPage.expectCartCount(2);
    await expect(inventoryPage.item(BIKE_LIGHT).getByRole('button', { name: 'Add to cart' })).toBeVisible();

    await inventoryPage.removeFromCart(BACKPACK);
    await inventoryPage.removeFromCart(ONESIE);
    await inventoryPage.expectCartCount(0);
  });

  test('cart contents survive a page reload', { tag: '@regression' }, async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.expectCartCount(1);

    await page.reload();

    await inventoryPage.expectCartCount(1);
    await expect(inventoryPage.item(BACKPACK).getByRole('button', { name: 'Remove' })).toBeVisible();
  });
});

test.describe('Product details page', { tag: '@regression' }, () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAs(loginPage, inventoryPage);
  });

  test('shows the same name and price as the product clicked in the list', async ({
    inventoryPage,
    productDetailsPage,
  }) => {
    const card = inventoryPage.item(BACKPACK);
    const listPrice = await card.getByTestId('inventory-item-price').textContent();
    const listDescription = await card.getByTestId('inventory-item-desc').textContent();

    await inventoryPage.openProduct(BACKPACK);

    await productDetailsPage.expectLoaded();
    await expect(productDetailsPage.name).toHaveText(BACKPACK);
    await expect(productDetailsPage.price).toHaveText(listPrice ?? '');
    await expect(productDetailsPage.description).toHaveText(listDescription ?? '');
    await expect(productDetailsPage.image).toBeVisible();
  });

  test('add to cart on the details page is reflected back on the products page', async ({
    inventoryPage,
    productDetailsPage,
  }) => {
    await inventoryPage.openProduct(BIKE_LIGHT);
    // Wait for the navigation to finish: until then the list page's 6 "Add to cart" buttons are still in the DOM.
    await productDetailsPage.expectLoaded();
    await expect(productDetailsPage.name).toHaveText(BIKE_LIGHT);
    await productDetailsPage.addToCartButton.click();

    await expect(productDetailsPage.removeButton).toBeVisible();
    await inventoryPage.expectCartCount(1);

    await productDetailsPage.backButton.click();

    await inventoryPage.expectLoaded();
    await inventoryPage.expectCartCount(1);
    await expect(inventoryPage.item(BIKE_LIGHT).getByRole('button', { name: 'Remove' })).toBeVisible();
  });
});
