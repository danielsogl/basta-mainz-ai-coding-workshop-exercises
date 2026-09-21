import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './server.ts';

// One test per acceptance criterion in docs/waitlist/spec.md.
describe('Waitlist', () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    server = createApp();
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    base = `http://127.0.0.1:${port}`;
  });

  afterEach(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const join = (eventId: string, body: unknown) =>
    fetch(`${base}/events/${eventId}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const length = async (eventId: string) => {
    const res = await fetch(`${base}/events/${eventId}/waitlist`);
    return ((await res.json()) as { length: number }).length;
  };

  it('AC1: first person on a sold-out event gets position 1', async () => {
    const res = await join('evt-1', { email: 'a@example.com' });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ position: 1 });
  });

  it('AC2: the next person gets the next position', async () => {
    await join('evt-1', { email: 'a@example.com' });
    const res = await join('evt-1', { email: 'b@example.com' });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ position: 2 });
  });

  it('AC3: joining twice returns the existing position without a duplicate', async () => {
    await join('evt-1', { email: 'a@example.com' });
    const res = await join('evt-1', { email: 'a@example.com' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ position: 1 });
    expect(await length('evt-1')).toBe(1);
  });

  it('AC4: an event that is not sold out rejects joins with 409', async () => {
    const res = await join('evt-2', { email: 'a@example.com' });
    expect(res.status).toBe(409);
    expect(await res.json()).toHaveProperty('error');
  });

  it('AC5: an unknown event is a 404 for join and length', async () => {
    expect((await join('nope', { email: 'a@example.com' })).status).toBe(404);
    expect((await fetch(`${base}/events/nope/waitlist`)).status).toBe(404);
  });

  it('AC6: a join without a valid email is a 400', async () => {
    for (const body of [{}, { email: 42 }, { email: 'not-an-email' }]) {
      const res = await join('evt-1', body);
      expect(res.status).toBe(400);
      expect(await res.json()).toHaveProperty('error');
    }
  });

  it('AC7: the waitlist length is reported per event', async () => {
    await join('evt-1', { email: 'a@example.com' });
    await join('evt-1', { email: 'b@example.com' });
    const res = await fetch(`${base}/events/evt-1/waitlist`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ eventId: 'evt-1', length: 2 });
  });
});
