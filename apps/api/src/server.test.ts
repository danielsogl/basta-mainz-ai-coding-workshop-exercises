import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './server.ts';

describe('Tickets API', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    server = createApp();
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  // Waits until the availability cache is warm, so only the FLAKY: test
  // below depends on timing. Without this, a slow or busy machine turns the
  // availability tests into unlabelled flakes.
  async function availability(eventId: string): Promise<Response> {
    for (let i = 0; i < 100; i++) {
      const res = await fetch(`${base}/events/${eventId}/availability`);
      if (res.status !== 503) return res;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('availability cache never warmed up');
  }

  // FLAKY BY DESIGN — see exercises/bonus-real-world-constraints.md.
  // The availability cache warms up asynchronously after boot (simulating a
  // slow upstream feed, 0-32ms). This test checks it right after startup
  // without waiting long enough for that to reliably finish, so it fails
  // roughly 1 run in 3. Do not "fix" this by adding a longer wait — the
  // exercise is to quarantine it correctly, not to make it pass.
  it('FLAKY: availability is ready shortly after the server starts', async () => {
    await new Promise((resolve) => setTimeout(resolve, 15));
    const res = await fetch(`${base}/events/evt-1/availability`);
    expect(res.status).toBe(200);
  });

  // BROKEN BASELINE — deterministic, pre-existing, unrelated to any
  // exercise. See exercises/bonus-real-world-constraints.md: record it, don't
  // "fix" it as part of an unrelated exercise. The `BASELINE:` prefix is
  // the single source of truth for "known, accepted-as-broken, not this
  // change's problem" — exercises/reference/hooks/verify-on-stop.mjs
  // reads it to avoid blocking every unrelated turn on this one test.
  it('BASELINE: reports health status as ok', async () => {
    const res = await fetch(`${base}/health`);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('computes an order total via the pricing package', async () => {
    const res = await fetch(`${base}/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitPriceCents: 1000, quantity: 2 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ totalCents: Math.round(2000 * 1.19) });
  });

  it('rejects a malformed price request', async () => {
    const res = await fetch(`${base}/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 2 }),
    });
    expect(res.status).toBe(400);
  });

  it('creates a legacy invoice via the legacy-invoice package', async () => {
    const res = await fetch(`${base}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Dave',
        items: [{ description: 'Ticket', unitPrice: 50, qty: 2 }],
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { total: number };
    expect(body.total).toBe(119);
  });

  it('lists all events with their availability', async () => {
    const res = await fetch(`${base}/events`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: 'evt-1', name: 'Conference Day 1', capacity: 100, sold: 100, available: 0, soldOut: true },
      { id: 'evt-2', name: 'Conference Day 2', capacity: 100, sold: 40, available: 60, soldOut: false },
    ]);
  });

  it('reports a sold-out event once the availability cache is warm', async () => {
    const res = await availability('evt-1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ eventId: 'evt-1', capacity: 100, sold: 100, available: 0, soldOut: true });
  });

  it('404s an unknown event', async () => {
    const res = await availability('nope');
    expect(res.status).toBe(404);
  });
});
