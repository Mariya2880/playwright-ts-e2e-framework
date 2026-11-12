import type { LoginPage } from '../pages/LoginPage';
import type { InventoryPage } from '../pages/InventoryPage';
import { env } from '../config/env';
import { users, type UserKey } from './users';

/**
 * UI login helper for specs that need an authenticated start.
 * Will be replaced by a storageState setup project once more suites depend on it.
 */
export async function loginAs(
  loginPage: LoginPage,
  inventoryPage: InventoryPage,
  user: UserKey = 'standard',
): Promise<void> {
  await loginPage.goto();
  await loginPage.login(users[user], env.uiPassword);
  await inventoryPage.expectLoaded();
}
