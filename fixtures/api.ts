import { test as base } from '@playwright/test';
import { BookingClient, type CreatedBooking } from '../api/BookingClient';
import { buildBooking } from '../utils/bookingData';
import { env } from '../config/env';

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

export { expect } from '@playwright/test';
