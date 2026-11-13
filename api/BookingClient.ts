import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface CreatedBooking {
  bookingid: number;
  booking: Booking;
}

/**
 * Thin, typed wrapper around the Restful-Booker endpoints.
 * Returns raw APIResponse objects so tests can assert on status codes and headers,
 * not only on parsed bodies.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  auth(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async createToken(username: string, password: string): Promise<string> {
    const res = await this.auth(username, password);
    const body = await res.json();
    if (!body.token) throw new Error(`Auth failed: ${JSON.stringify(body)}`);
    return body.token;
  }

  list(params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get('/booking', { params });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  update(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeader(token) });
  }

  patch(id: number, partial: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: partial, headers: authHeader(token) });
  }

  delete(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authHeader(token) });
  }
}

function authHeader(token?: string): Record<string, string> {
  return token === undefined ? {} : { Cookie: `token=${token}` };
}
