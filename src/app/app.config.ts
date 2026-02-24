import { ApplicationConfig, APP_INITIALIZER, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { FalStore } from './fal';
import { OpenAiStore } from './open-ai';
import { WavespeedStore } from './wavespeed';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    {
      // Eagerly instantiate stores so Redux DevTools connections are established on startup
      provide: APP_INITIALIZER,
      useFactory: () => {
        inject(FalStore);
        inject(OpenAiStore);
        inject(WavespeedStore);
        return () => {};
      },
      multi: true,
    },
  ],
};
