import { test as setup, expect } from '@playwright/test';
import { env } from '../config/env';
import { users } from '../utils/users';
import { STORAGE_STATE } from './auth.setup.paths';

setup('authenticate as standard user', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(users.standard);
  await page.getByPlaceholder('Password').fill(env.uiPassword);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByTestId('title')).toHaveText('Products');
  await page.context().storageState({ path: STORAGE_STATE });
});
