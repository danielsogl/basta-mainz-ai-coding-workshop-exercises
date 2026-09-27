import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EventsApi } from './events-api';

@Component({
  selector: 'app-events-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './events-page.html',
  styleUrl: './events-page.scss',
})
export class EventsPage {
  protected readonly events = inject(EventsApi).events();
}
