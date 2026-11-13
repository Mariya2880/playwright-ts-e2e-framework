import { test, expect } from '../../fixtures/test';
import { loginAs } from '../../utils/session';

const BACKPACK = 'Sauce Labs Backpack';
const FLEECE = 'Sauce Labs Fleece Jacket';

test.describe('Cart', { tag: '@regression' }, () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAs(loginPage, inventoryPage);
  });

  test('shows exactly the items added, with matching prices and quantity 1', async ({
    inventoryPage,
    cartPage,
  }) => {
    const backpackPrice = await inventoryPage.item(BACKPACK).getByTestId('inventory-item-price').textContent();
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(FLEECE);

    await inventoryPage.cartLink.click();

    await cartPage.expectLoaded();
    expect(await cartPage.itemNames()).toEqual([BACKPACK, FLEECE]);
    await expect(cartPage.item(BACKPACK).getByTestId('inventory-item-price')).toHaveText(backpackPrice ?? '');
    await expect(cartPage.item(BACKPACK).getByTestId('item-quantity')).toHaveText('1');
  });

  test('removing an item updates the list and the badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(FLEECE);
    await cartPage.goto();

    await cartPage.remove(BACKPACK);

    expect(await cartPage.itemNames()).toEqual([FLEECE]);
    await inventoryPage.expectCartCount(1);
  });

  test('continue shopping returns to products with the cart intact', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await cartPage.goto();

    await cartPage.continueShoppingButton.click();

    await inventoryPage.expectLoaded();
    await inventoryPage.expectCartCount(1);
  });
});
