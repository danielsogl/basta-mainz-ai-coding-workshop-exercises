import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./events/events-page').then((m) => m.EventsPage) },
  { path: '**', redirectTo: '' },
];
