import type { Routes } from '@angular/router';
import { EventsPage } from './events/events-page';

export const routes: Routes = [
  // The landing page is loaded eagerly; lazy-load feature pages added later.
  { path: '', component: EventsPage, title: 'Events' },
  { path: '**', redirectTo: '' },
];
