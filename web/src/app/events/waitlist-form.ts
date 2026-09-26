import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventsApi } from './events-api';
import type { WaitlistEntry } from './events.model';

const serverErrors: Record<number, string> = {
  400: 'The API rejected this email address.',
  404: 'This event no longer exists.',
  409: 'This event is not sold out. Buy a ticket instead.',
};

/** Waitlist size and "Join waitlist" form for a sold-out event (Signal Forms). */
@Component({
  selector: 'app-waitlist-form',
  imports: [FormField, FormRoot, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './waitlist-form.html',
  styleUrl: './waitlist-form.scss',
})
export class WaitlistForm {
  readonly eventId = input.required<string>();

  private readonly api = inject(EventsApi);
  protected readonly joined = signal<WaitlistEntry | null>(null);
  protected readonly waitlist = this.api.waitlist(this.eventId);
  protected readonly waiting = computed(() => {
    if (!this.waitlist.hasValue()) return '';
    const { length } = this.waitlist.value();
    if (length === 0) return 'Nobody waiting yet';
    return length === 1 ? '1 person waiting' : `${length} people waiting`;
  });

  protected readonly waitlistForm = form(
    signal({ email: '' }),
    (path) => {
      required(path.email, { message: 'Email is required.' });
      email(path.email, { message: 'Enter a valid email address.' });
    },
    {
      submission: {
        action: async (f) => {
          try {
            const entry = await this.api.joinWaitlist(this.eventId(), f.email().value());
            this.joined.set(entry);
            this.waitlist.reload();
            return undefined;
          } catch (error) {
            const status = error instanceof HttpErrorResponse ? error.status : 0;
            return {
              fieldTree: f.email,
              kind: 'server',
              message: serverErrors[status] ?? 'Could not join the waitlist. Try again.',
            };
          }
        },
      },
    },
  );
}
