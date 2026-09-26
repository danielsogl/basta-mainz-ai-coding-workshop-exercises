import { httpResource } from '@angular/common/http';
import { Service } from '@angular/core';
import type { TicketEvent } from './events.model';

/** HTTP access to the Tickets API. `/api` is proxied to apps/api in dev (proxy.conf.json). */
@Service()
export class EventsApi {
  /** Needs an injection context (e.g. a field initializer); lives as long as its caller. */
  events() {
    return httpResource<TicketEvent[]>(() => '/api/events');
  }
}
