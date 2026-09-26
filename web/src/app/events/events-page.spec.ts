import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { HarnessLoader } from '@angular/cdk/testing';
import { manualChangeDetection } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardHarness } from '@angular/material/card/testing';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';
import type { TicketEvent } from './events.model';
import { EventsPage } from './events-page';

const events: TicketEvent[] = [
  { id: 'evt-1', name: 'Angular Deep Dive', capacity: 50, sold: 20, available: 30, soldOut: false },
  { id: 'evt-2', name: 'BASTA! Keynote', capacity: 100, sold: 100, available: 0, soldOut: true },
];

// Harnesses wait for fixture.whenStable(), which also waits for open HTTP requests.
// So: flush the request first, then use harnesses. manualChangeDetection() is only
// used while a request is deliberately left open (loading state, retry click).
describe('EventsPage', () => {
  let fixture: ComponentFixture<EventsPage>;
  let loader: HarnessLoader;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EventsPage);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => http.verify());

  /** Waits until the page has sent GET /api/events (after its first render or a reload). */
  const eventsRequest = () => vi.waitFor(() => http.expectOne('/api/events'));

  it('shows a loading indicator until events arrive', async () => {
    const request = await eventsRequest();
    await manualChangeDetection(async () => {
      const bar = await loader.getHarness(MatProgressBarHarness);
      expect(await bar.getMode()).toBe('indeterminate');
    });

    request.flush([]);
    await fixture.whenStable();

    expect(await loader.getAllHarnesses(MatProgressBarHarness)).toHaveLength(0);
  });

  it('renders each event with its sales and marks sold-out events', async () => {
    (await eventsRequest()).flush(events);
    await fixture.whenStable();

    const card = await loader.getHarness(MatCardHarness.with({ title: 'Angular Deep Dive' }));
    expect(await card.getSubtitleText()).toBe('20 of 50 sold');
    expect(await card.getText()).toContain('30 left');
    const bar = await card.getHarness(MatProgressBarHarness);
    expect(await bar.getValue()).toBe(40);

    expect(await card.getText()).not.toContain('Sold out');
    const soldOut = await loader.getHarness(MatCardHarness.with({ title: 'BASTA! Keynote' }));
    expect(await soldOut.getText()).toContain('Sold out');
  });

  it('shows how to start the API when loading fails, and retries', async () => {
    (await eventsRequest()).flush(null, { status: 504, statusText: 'Gateway Timeout' });
    await fixture.whenStable();

    const error = await loader.getHarness(MatCardHarness.with({ title: 'Could not load events' }));
    expect(await error.getText()).toContain('npm start --workspace apps/api');

    const retry = await loader.getHarness(MatButtonHarness.with({ text: 'Retry' }));
    await manualChangeDetection(() => retry.click());
    (await eventsRequest()).flush(events);
    await fixture.whenStable();

    expect(await loader.getAllHarnesses(MatCardHarness.with({ title: 'BASTA! Keynote' }))).toHaveLength(1);
  });
});
