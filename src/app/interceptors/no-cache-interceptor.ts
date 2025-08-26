// src/app/interceptors/no-cache-interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GITUHB_DOMAIN } from '../util/constants';

export const noCacheInterceptor: HttpInterceptorFn =
    (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const isCrossOrigin: boolean = !req.url.startsWith(location.origin);
        const isGitHub: boolean = req.url.includes(GITUHB_DOMAIN);
        if (isCrossOrigin || isGitHub) {
            // Let it pass without forbidden request headers
            return next(req);
        }
        const modified: HttpRequest<unknown> = req.clone({
            setHeaders: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' }
        });
        return next(modified);
    };
