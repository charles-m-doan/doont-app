// src/app/interceptors/cache-buster.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GITUHB_DOMAIN } from '../util/constants';

export const cacheBusterInterceptor: HttpInterceptorFn =
    (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        // Only apply to GitHub API calls
        if (req.url.includes(GITUHB_DOMAIN)) {
            const separator: string = req.url.includes('?') ? '&' : '?';
            const bustedUrl: string = `${req.url}${separator}t=${Date.now()}`;
            const modified: HttpRequest<unknown> = req.clone({ url: bustedUrl });
            return next(modified);
        }
        return next(req);
    };
