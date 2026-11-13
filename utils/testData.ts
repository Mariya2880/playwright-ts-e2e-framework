import { faker } from '@faker-js/faker';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Fresh, realistic customer data per test run, so tests never depend on shared fixtures. */
export function buildCustomer(overrides: Partial<CustomerInfo> = {}): CustomerInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

/** Converts a "$29.99" style label into a number. */
export function parseMoney(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d{1,2})?)/);
  if (!match) throw new Error(`No money amount found in "${text}"`);
  return Number(match[1]);
}

export const roundToCents = (value: number): number => Math.round(value * 100) / 100;
