import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

/**
 * Page objects are injected as fixtures so specs describe behaviour only:
 * no `new XPage(page)` boilerplate, and each test gets fresh, isolated instances.
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

export { expect } from '@playwright/test';
