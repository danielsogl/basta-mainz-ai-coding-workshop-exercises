import { provideHttpClient } from '@angular/common/http';
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
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
    TestBed.tick();
    http.expectOne('/api/events').flush(events);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(resource.value()).toEqual(events);
  });
});
