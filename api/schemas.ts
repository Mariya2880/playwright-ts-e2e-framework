import { z } from 'zod';

/**
 * Response contracts for the Restful-Booker API.
 *
 * Objects are strict: an unexpected field fails the test just like a missing one, so contract drift
 * (a renamed field, a leaked internal property, a number sent as a string) is caught on the first run,
 * not when a consumer breaks. The TypeScript types used by the client are derived from these schemas,
 * so types and runtime checks can never disagree.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a YYYY-MM-DD date');

export const BookingDatesSchema = z.strictObject({
  checkin: isoDate,
  checkout: isoDate,
});

export const BookingSchema = z.strictObject({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const CreatedBookingSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.strictObject({ bookingid: z.number().int().positive() }));

export const AuthTokenSchema = z.strictObject({ token: z.string().regex(/^\w+$/) });

export const AuthFailureSchema = z.strictObject({ reason: z.literal('Bad credentials') });

export type BookingDates = z.infer<typeof BookingDatesSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreatedBooking = z.infer<typeof CreatedBookingSchema>;

/** Turns Zod issues into one line per problem, e.g. "bookingdates.checkin: expected a YYYY-MM-DD date". */
export function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.length ? issue.path.join('.') : '(root)'}: ${issue.message}`)
    .join('\n');
}
