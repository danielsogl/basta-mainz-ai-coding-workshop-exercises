import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { HarnessLoader } from '@angular/cdk/testing';
import { manualChangeDetection } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { WaitlistForm } from './waitlist-form';

// Harnesses wait for fixture.whenStable(), which also waits for open HTTP requests.
// So: flush the request first, then use harnesses. The submit click runs under
// manualChangeDetection() because it deliberately leaves the POST open.
describe('WaitlistForm', () => {
  const url = '/api/events/evt-2/waitlist';
  let fixture: ComponentFixture<WaitlistForm>;
  let loader: HarnessLoader;
  let http: HttpTestingController;
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  /** Answers the GET for the waitlist size, once the component has sent it. */
  async function flushLength(length: number) {
    const get = await vi.waitFor(() => http.expectOne({ method: 'GET', url }));
    get.flush({ eventId: 'evt-2', length });
    await fixture.whenStable();
  }

  /** Types an email and clicks "Join waitlist". */
  async function submit(email: string) {
    const input = await loader.getHarness(MatInputHarness);
    await input.setValue(email);
    const button = await loader.getHarness(MatButtonHarness.with({ text: 'Join waitlist' }));
    await manualChangeDetection(() => button.click());
  }

  async function errors() {
    const field = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: /Email/ }));
    return field.getTextErrors();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WaitlistForm);
    fixture.componentRef.setInput('eventId', 'evt-2');
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => http.verify());

  it.each([
    [0, 'Nobody waiting yet'],
    [1, '1 person waiting'],
    [3, '3 people waiting'],
  ])('shows a waitlist of %i as "%s"', async (length, label) => {
    await flushLength(length);

    expect(text()).toContain(label);
  });

  it('rejects an invalid email without calling the API', async () => {
    await flushLength(0);

    await submit('not-an-email');
    await fixture.whenStable();

    expect(await errors()).toEqual(['Enter a valid email address.']);
  });

  it('shows the position after joining and reloads the waitlist size', async () => {
    await flushLength(2);

    await submit('ada@example.com');
    const post = http.expectOne({ method: 'POST', url });
    expect(post.request.body).toEqual({ email: 'ada@example.com' });
    post.flush({ position: 3 }, { status: 201, statusText: 'Created' });
    await flushLength(3);

    expect(text()).toContain('You are #3 on the waitlist.');
    expect(text()).toContain('3 people waiting');
  });

  it('says so when the email was already on the list', async () => {
    await flushLength(1);

    await submit('ada@example.com');
    http.expectOne({ method: 'POST', url }).flush({ position: 1 }, { status: 200, statusText: 'OK' });
    await flushLength(1);

    expect(text()).toContain('You are already on the waitlist as #1.');
    expect(text()).toContain('1 person waiting');
  });

  it('explains a 409 from the API', async () => {
    await flushLength(0);

    await submit('ada@example.com');
    http.expectOne({ method: 'POST', url }).flush({ error: 'not sold out' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(await errors()).toEqual(['This event is not sold out. Buy a ticket instead.']);
  });
});
