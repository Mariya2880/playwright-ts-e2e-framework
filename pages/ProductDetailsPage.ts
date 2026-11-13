import { type Locator, type Page, expect } from '@playwright/test';

export class ProductDetailsPage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.image = page.locator('.inventory_details_img');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
    this.backButton = page.getByTestId('back-to-products');
  }

  /**
   * Sauce Demo is a single-page app: the URL changes before the list is replaced by the details view.
   * Waiting for an element that only exists on the details page (the Back button) makes this race-free,
   * so every locator below is unambiguous afterwards.
   */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);
    await expect(this.backButton).toBeVisible();
    await expect(this.name).toHaveCount(1);
  }
}
