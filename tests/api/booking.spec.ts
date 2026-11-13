import { test, expect } from '../../fixtures/api';
import { buildBooking } from '../../utils/bookingData';
import { env } from '../../config/env';

const bookingShape = {
  firstname: expect.any(String),
  lastname: expect.any(String),
  totalprice: expect.any(Number),
  depositpaid: expect.any(Boolean),
  bookingdates: { checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
};

test.describe('Restful-Booker API', () => {
  test('health check responds', { tag: '@smoke' }, async ({ bookingApi }) => {
    const res = await bookingApi.ping();
    // Restful-Booker returns 201 for /ping, a documented quirk of this API.
    expect(res.status()).toBe(201);
  });

  test.describe('auth', { tag: '@regression' }, () => {
    test('valid credentials return a token', async ({ bookingApi }) => {
      const res = await bookingApi.auth(env.apiUser, env.apiPassword);

      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ token: expect.stringMatching(/^\w+$/) });
    });

    test('invalid credentials return no token', async ({ bookingApi }) => {
      const res = await bookingApi.auth(env.apiUser, 'wrong-password');

      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ reason: 'Bad credentials' });
    });
  });

  test('booking lifecycle: create → read → update → patch → delete', { tag: '@smoke' }, async ({
    bookingApi,
    token,
  }) => {
    const original = buildBooking();
    let id = 0;

    await test.step('create', async () => {
      const res = await bookingApi.create(original);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');

      const body = await res.json();
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking).toEqual(original);
      id = body.bookingid;
    });

    await test.step('read back matches what was sent', async () => {
      const res = await bookingApi.get(id);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject(bookingShape);
      expect(body).toEqual(original);
    });

    const updated = buildBooking();

    await test.step('full update (PUT)', async () => {
      const res = await bookingApi.update(id, updated, token);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(updated);
    });

    await test.step('partial update (PATCH) changes only the given fields', async () => {
      const res = await bookingApi.patch(id, { firstname: 'Patched', totalprice: 111 }, token);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ ...updated, firstname: 'Patched', totalprice: 111 });
    });

    await test.step('delete', async () => {
      const res = await bookingApi.delete(id, token);
      // 201 on DELETE is another documented Restful-Booker quirk.
      expect(res.status()).toBe(201);
    });

    await test.step('deleted booking is gone', async () => {
      const res = await bookingApi.get(id);
      expect(res.status()).toBe(404);
    });
  });

  test('a new booking can be found by name filter', { tag: '@regression' }, async ({ bookingApi, booking }) => {
    const res = await bookingApi.list({
      firstname: booking.booking.firstname,
      lastname: booking.booking.lastname,
    });

    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(booking.bookingid);
  });

  test('requesting a booking that does not exist returns 404', { tag: '@regression' }, async ({ bookingApi }) => {
    const res = await bookingApi.get(2_147_483_000);
    expect(res.status()).toBe(404);
  });
});

test.describe('Restful-Booker API: authorisation enforcement', { tag: ['@regression', '@security'] }, () => {
  // Write operations must be rejected unless the caller proves who they are.
  // Each case also re-reads the booking to prove nothing was changed, not just that a 403 came back.
  const unauthorisedCalls = [
    { name: 'no token', token: undefined },
    { name: 'empty token', token: '' },
    { name: 'forged token', token: 'abc123forged' },
  ];

  for (const { name, token } of unauthorisedCalls) {
    test(`PUT with ${name} is rejected and the booking is unchanged`, async ({ bookingApi, booking }) => {
      const res = await bookingApi.update(booking.bookingid, buildBooking(), token);

      expect(res.status()).toBe(403);
      const after = await (await bookingApi.get(booking.bookingid)).json();
      expect(after).toEqual(booking.booking);
    });

    test(`DELETE with ${name} is rejected and the booking still exists`, async ({ bookingApi, booking }) => {
      const res = await bookingApi.delete(booking.bookingid, token);

      expect(res.status()).toBe(403);
      expect((await bookingApi.get(booking.bookingid)).status()).toBe(200);
    });
  }

  test('PATCH without a token cannot change the price', async ({ bookingApi, booking }) => {
    const res = await bookingApi.patch(booking.bookingid, { totalprice: 1 });

    expect(res.status()).toBe(403);
    const after = await (await bookingApi.get(booking.bookingid)).json();
    expect(after.totalprice).toBe(booking.booking.totalprice);
  });
});
