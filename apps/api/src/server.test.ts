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

  // FLAKY BY DESIGN — see exercises/bonus-real-world-constraints.md.
  // The availability cache warms up asynchronously after boot (simulating a
  // slow upstream feed, 0-20ms). This test checks it right after startup
  // without waiting long enough for that to reliably finish, so it fails
  // roughly 1 run in 4. Do not "fix" this by adding a longer wait — the
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
  // change's problem" — exercises/reference/claude-code/hooks/stop-verify.sh
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

  it('reports a sold-out event once the availability cache is warm', async () => {
    // by now the cache has had well over 20ms to warm up
    const res = await fetch(`${base}/events/evt-1/availability`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ eventId: 'evt-1', capacity: 100, sold: 100, available: 0, soldOut: true });
  });

  it('404s an unknown event', async () => {
    const res = await fetch(`${base}/events/nope/availability`);
    expect(res.status).toBe(404);
  });
});
