import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { noCacheInterceptor } from './interceptors/no-cache-interceptor';
import { cacheBusterInterceptor } from './interceptors/cache-buster.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([noCacheInterceptor, cacheBusterInterceptor]))
  ]
};
