import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import type { TicketEvent, WaitlistEntry, WaitlistInfo } from './events.model';

/** HTTP access to the Tickets API. `/api` is proxied to apps/api in dev (proxy.conf.json). */
@Service()
export class EventsApi {
  private readonly http = inject(HttpClient);

  /** Needs an injection context (e.g. a field initializer); lives as long as its caller. */
  events() {
    return httpResource<TicketEvent[]>(() => '/api/events');
  }

  /** Needs an injection context; refetches when `eventId` changes. */
  waitlist(eventId: () => string) {
    return httpResource<WaitlistInfo>(() => `/api/events/${eventId()}/waitlist`);
  }

  joinWaitlist(eventId: string, email: string): Promise<WaitlistEntry> {
    return firstValueFrom(
      this.http
        .post<{ position: number }>(`/api/events/${eventId}/waitlist`, { email }, { observe: 'response' })
        .pipe(map((res) => ({ position: res.body?.position ?? 0, alreadyOnList: res.status === 200 }))),
    );
  }
}
