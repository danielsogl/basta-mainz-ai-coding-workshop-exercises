import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// No provideHttpClient(): since v21 HttpClient is injectable by default and uses fetch.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
