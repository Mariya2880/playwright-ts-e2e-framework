import { test, expect } from '../../fixtures/api';
import { BookingSchema, CreatedBookingSchema } from '../../api/schemas';
import { buildBooking } from '../../utils/bookingData';

/**
 * Tests for the contract checks themselves. They run without the network and prove the schemas
 * catch the kinds of API drift that a loose `toMatchObject` check lets through.
 */
test.describe('API contract schemas', { tag: '@contract' }, () => {
  test('a booking built by the test data factory matches the contract', async () => {
    await expect(buildBooking()).toMatchSchema(BookingSchema);
    await expect({ bookingid: 1, booking: buildBooking() }).toMatchSchema(CreatedBookingSchema);
  });

  const drift = [
    {
      name: 'a missing field',
      change: (b: Record<string, unknown>) => Object.fromEntries(Object.entries(b).filter(([key]) => key !== 'lastname')),
      path: 'lastname',
    },
    { name: 'a number sent as a string', change: (b: Record<string, unknown>) => ({ ...b, totalprice: '150' }), path: 'totalprice' },
    { name: 'an unexpected field', change: (b: Record<string, unknown>) => ({ ...b, internalNote: 'x' }), path: '(root)' },
    {
      name: 'a date in the wrong format',
      change: (b: Record<string, unknown>) => ({ ...b, bookingdates: { checkin: '01/12/2026', checkout: '2026-12-05' } }),
      path: 'bookingdates.checkin',
    },
  ];

  for (const { name, change, path } of drift) {
    test(`rejects ${name} and names the field`, async () => {
      const broken = change({ ...buildBooking() });

      await expect(broken).not.toMatchSchema(BookingSchema);
      await expect(expect(broken).toMatchSchema(BookingSchema)).rejects.toThrow(path);
    });
  }
});
