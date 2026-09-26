import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { TicketEvent } from './events.model';
import { EventsPage } from './events-page';

const events: TicketEvent[] = [
  { id: 'evt-1', name: 'Angular Deep Dive', capacity: 50, sold: 20, available: 30, soldOut: false },
  { id: 'evt-2', name: 'BASTA! Keynote', capacity: 100, sold: 100, available: 0, soldOut: true },
];

describe('EventsPage', () => {
  let fixture: ComponentFixture<EventsPage>;
  let http: HttpTestingController;
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EventsPage);
    // Not whenStable(): that would wait for the pending request we want to control.
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows a loading indicator until events arrive', () => {
    expect(fixture.nativeElement.querySelector('[aria-label="Loading events"]')).not.toBeNull();
    http.expectOne('/api/events').flush([]);
  });

  it('renders each event with its sales and a sold-out chip', async () => {
    http.expectOne('/api/events').flush(events);
    await fixture.whenStable();

    expect(text()).toContain('Angular Deep Dive');
    expect(text()).toContain('20 of 50 sold');
    expect(text()).toContain('30 left');
    expect(fixture.nativeElement.querySelectorAll('.sold-out')).toHaveLength(1);
  });

  it('shows how to start the API when loading fails, and retries', async () => {
    http.expectOne('/api/events').flush(null, { status: 504, statusText: 'Gateway Timeout' });
    await fixture.whenStable();

    expect(text()).toContain('Could not load events');
    expect(text()).toContain('npm start --workspace apps/api');

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    fixture.detectChanges();
    http.expectOne('/api/events').flush(events);
    await fixture.whenStable();

    expect(text()).toContain('BASTA! Keynote');
  });
});
