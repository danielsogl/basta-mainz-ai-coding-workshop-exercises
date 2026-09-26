import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EventsApi } from './events-api';
import type { TicketEvent } from './events.model';

describe('EventsApi', () => {
  let api: EventsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    api = TestBed.inject(EventsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads events from /api/events', async () => {
    const events: TicketEvent[] = [
      { id: 'evt-1', name: 'BASTA! Keynote', capacity: 100, sold: 100, available: 0, soldOut: true },
    ];

    const resource = TestBed.runInInjectionContext(() => api.events());
    const request = await vi.waitFor(() => http.expectOne('/api/events'));
    request.flush(events);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(resource.value()).toEqual(events);
  });

  it('loads the waitlist size of one event', async () => {
    const resource = TestBed.runInInjectionContext(() => api.waitlist(() => 'evt-2'));
    const request = await vi.waitFor(() => http.expectOne('/api/events/evt-2/waitlist'));
    request.flush({ eventId: 'evt-2', length: 3 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(resource.value()).toEqual({ eventId: 'evt-2', length: 3 });
  });

  it('posts the email to the waitlist endpoint', async () => {
    const joined = api.joinWaitlist('evt-2', 'ada@example.com');

    const req = http.expectOne('/api/events/evt-2/waitlist');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ada@example.com' });
    req.flush({ position: 1 }, { status: 201, statusText: 'Created' });

    await expect(joined).resolves.toEqual({ position: 1, alreadyOnList: false });
  });

  it('reports a repeated join (200) as already on the list', async () => {
    const joined = api.joinWaitlist('evt-2', 'ada@example.com');
    http.expectOne('/api/events/evt-2/waitlist').flush({ position: 1 }, { status: 200, statusText: 'OK' });

    await expect(joined).resolves.toEqual({ position: 1, alreadyOnList: true });
  });
});
