import { type Locator, type Page, expect } from '@playwright/test';
import type { CustomerInfo } from '../utils/testData';
import { parseMoney } from '../utils/testData';

/** Step one: customer information form. */
export class CheckoutInfoPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.error = page.getByTestId('error');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html$/);
  }

  async fill(customer: CustomerInfo): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
  }

  async submit(customer: CustomerInfo): Promise<void> {
    await this.fill(customer);
    await this.continueButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toHaveText(`Error: ${message}`);
  }
}

/** Step two: order overview with price summary. */
export class CheckoutOverviewPage {
  readonly items: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
  }

  async prices(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(parseMoney);
  }

  async summary(): Promise<{ subtotal: number; tax: number; total: number }> {
    return {
      subtotal: parseMoney((await this.subtotal.textContent()) ?? ''),
      tax: parseMoney((await this.tax.textContent()) ?? ''),
      total: parseMoney((await this.total.textContent()) ?? ''),
    };
  }
}

/** Final confirmation page. */
export class CheckoutCompletePage {
  readonly header: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.header = page.getByTestId('complete-header');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(this.header).toHaveText('Thank you for your order!');
  }
}
