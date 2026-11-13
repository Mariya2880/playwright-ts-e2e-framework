import { faker } from '@faker-js/faker';
import type { Booking } from '../api/BookingClient';

const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

/** A valid booking with unique data, so parallel tests never collide on the shared demo API. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 10, refDate: checkin });
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: isoDate(checkin), checkout: isoDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Parking']),
    ...overrides,
  };
}
