import { test as base, expect as baseExpect, type APIResponse } from '@playwright/test';
import type { z } from 'zod';
import { BookingClient, type CreatedBooking } from '../api/BookingClient';
import { buildBooking } from '../utils/bookingData';
import { env } from '../config/env';
import { describeIssues } from '../api/schemas';

type ApiFixtures = {
  bookingApi: BookingClient;
  token: string;
  /** A fresh booking created for this test only and cleaned up afterwards. */
  booking: CreatedBooking;
};

export const test = base.extend<ApiFixtures>({
  bookingApi: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  token: async ({ bookingApi }, use) => {
    await use(await bookingApi.createToken(env.apiUser, env.apiPassword));
  },

  booking: async ({ bookingApi, token }, use) => {
    const res = await bookingApi.create(buildBooking());
    if (!res.ok()) throw new Error(`Setup failed: POST /booking returned ${res.status()}`);
    const created: CreatedBooking = await res.json();

    await use(created);

    // Teardown: best effort, the test itself may already have deleted it.
    await bookingApi.delete(created.bookingid, token);
  },
});

/**
 * `await expect(response).toMatchSchema(Schema)`: a contract assertion. Accepts an APIResponse (its JSON
 * body is checked) or a plain value, and lists every mismatching field by path, so a failure reads
 * "bookingdates.checkin: expected a YYYY-MM-DD date" instead of a large JSON diff.
 */
export const expect = baseExpect.extend({
  async toMatchSchema(received: APIResponse | unknown, schema: z.ZodType) {
    const value = isApiResponse(received) ? await received.json() : received;
    const result = schema.safeParse(value);
    const pass = result.success;
    const message = () =>
      pass
        ? 'Expected the value NOT to match the schema, but it did.'
        : `Response does not match the API contract:\n${describeIssues(result.error!)}\n\n` +
          `Received:\n${JSON.stringify(value, null, 2)}`;
    return { pass, message, name: 'toMatchSchema', expected: 'a value matching the schema', actual: value };
  },
});

function isApiResponse(value: unknown): value is APIResponse {
  return typeof value === 'object' && value !== null && 'json' in value && typeof value.json === 'function' && 'status' in value;
}
