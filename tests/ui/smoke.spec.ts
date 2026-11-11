import { test, expect } from '@playwright/test';

test.describe('Framework smoke check', { tag: '@smoke' }, () => {
  test('login page loads with all form controls', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Swag Labs');
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
  });
});
