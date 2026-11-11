import { test, expect } from '../../fixtures/test';
import { env } from '../../config/env';
import { users } from '../../utils/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in and lands on the products page', { tag: '@smoke' }, async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(users.standard, env.uiPassword);

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('locked-out user is rejected with a clear message', { tag: '@regression' }, async ({
    loginPage,
    page,
  }) => {
    await loginPage.login(users.lockedOut, env.uiPassword);

    await loginPage.expectError('Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory/);
  });

  const invalidInputs = [
    { case: 'wrong password', user: users.standard, pass: 'not_the_password', message: 'Username and password do not match any user in this service' },
    { case: 'unknown user', user: 'no_such_user', pass: env.uiPassword, message: 'Username and password do not match any user in this service' },
    { case: 'empty username', user: '', pass: env.uiPassword, message: 'Username is required' },
    { case: 'empty password', user: users.standard, pass: '', message: 'Password is required' },
  ];

  for (const input of invalidInputs) {
    test(`shows validation error for ${input.case}`, { tag: '@regression' }, async ({ loginPage }) => {
      await loginPage.login(input.user, input.pass);
      await loginPage.expectError(input.message);
    });
  }

  test('protected page redirects unauthenticated users to login', { tag: '@regression' }, async ({
    page,
    loginPage,
  }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in.");
  });

  test('logout ends the session', { tag: '@regression' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard, env.uiPassword);
    await inventoryPage.expectLoaded();

    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();

    // Navigating back to a protected page must not restore the session.
    await inventoryPage.goto();
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in.");
  });
});
