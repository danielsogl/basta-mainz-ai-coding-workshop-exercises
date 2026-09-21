import { createServer as createHttpServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { generateInvoice } from '@tickets/legacy-invoice';
import { calculateOrderTotalCents } from '@tickets/pricing';
import { Waitlists } from './waitlist.ts';

export interface EventRecord {
  id: string;
  name: string;
  capacity: number;
  sold: number;
}

export const seedEvents: EventRecord[] = [
  { id: 'evt-1', name: 'Conference Day 1', capacity: 100, sold: 100 },
  { id: 'evt-2', name: 'Conference Day 2', capacity: 100, sold: 40 },
];

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
}

function availabilityOf(event: EventRecord) {
  const available = event.capacity - event.sold;
  return { capacity: event.capacity, sold: event.sold, available, soldOut: available <= 0 };
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

/**
 * Builds the Tickets HTTP API. Each call gets its own in-memory
 * availability cache, which starts "cold" and warms up shortly after
 * startup — see the `availabilityCacheWarm` comment below.
 */
export function createApp(): Server {
  let availabilityCacheWarm = false;
  // Simulates the seat-availability feed's real upstream latency: it's not
  // instant, so the cache takes a little while to warm up after boot.
  // ponytail: 32ms is tuned empirically against server.test.ts's fixed 15ms
  // check delay to land the FLAKY test's failure rate around 1-in-4 on this
  // machine (see exercises/bonus-real-world-constraints.md); it isn't a real
  // SLA number.
  const upstreamLatencyMs = Math.random() * 32;
  setTimeout(() => {
    availabilityCacheWarm = true;
  }, upstreamLatencyMs);

  const waitlists = new Waitlists();

  async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'healthy' });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/price') {
      const body = await readJsonBody(req);
      if (typeof body.unitPriceCents !== 'number' || typeof body.quantity !== 'number') {
        sendJson(res, 400, { error: 'unitPriceCents and quantity must be numbers' });
        return;
      }
      const totalCents = calculateOrderTotalCents({
        unitPriceCents: body.unitPriceCents,
        quantity: body.quantity,
        promoCode: typeof body.promoCode === 'string' ? body.promoCode : undefined,
      });
      sendJson(res, 200, { totalCents });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/events') {
      sendJson(
        res,
        200,
        seedEvents.map((event) => ({ id: event.id, name: event.name, ...availabilityOf(event) })),
      );
      return;
    }

    const availabilityMatch = /^\/events\/([^/]+)\/availability$/.exec(url.pathname);
    if (req.method === 'GET' && availabilityMatch) {
      if (!availabilityCacheWarm) {
        sendJson(res, 503, { error: 'availability cache warming up' });
        return;
      }
      const event = seedEvents.find((candidate) => candidate.id === availabilityMatch[1]);
      if (!event) {
        sendJson(res, 404, { error: 'event not found' });
        return;
      }
      sendJson(res, 200, { eventId: event.id, ...availabilityOf(event) });
      return;
    }

    const waitlistMatch = /^\/events\/([^/]+)\/waitlist$/.exec(url.pathname);
    if (waitlistMatch && (req.method === 'POST' || req.method === 'GET')) {
      const event = seedEvents.find((candidate) => candidate.id === waitlistMatch[1]);
      if (!event) {
        sendJson(res, 404, { error: 'event not found' });
        return;
      }
      if (req.method === 'GET') {
        sendJson(res, 200, { eventId: event.id, length: waitlists.length(event.id) });
        return;
      }
      const body = await readJsonBody(req);
      if (typeof body.email !== 'string' || !body.email.includes('@')) {
        sendJson(res, 400, { error: 'email must be a string containing @' });
        return;
      }
      if (event.capacity - event.sold > 0) {
        sendJson(res, 409, { error: 'event is not sold out' });
        return;
      }
      const { position, created } = waitlists.join(event.id, body.email);
      sendJson(res, created ? 201 : 200, { position });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/invoices') {
      const body = await readJsonBody(req);
      const invoice = generateInvoice(body.customerName, (body.items as unknown[] | undefined) ?? [], body.opts ?? {});
      sendJson(res, 200, invoice);
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  }

  return createHttpServer((req, res) => {
    void handleRequest(req, res).catch((err: unknown) => {
      sendJson(res, 500, { error: err instanceof Error ? err.message : 'internal error' });
    });
  });
}
