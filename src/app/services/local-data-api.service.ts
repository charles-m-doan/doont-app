import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface LocalTreeResponseDto {
    paths: string[];
}

export interface LocalFileResponseDto {
    path: string;
    base64: string;
}

export interface LocalApiError {
    status: number;
    message: string;
    method: string;
    url: string;
}

@Injectable({ providedIn: 'root' })
export class LocalDataApiService {
    private readonly http: HttpClient = inject(HttpClient);

    public getTree$(baseUrl: string): Observable<string[]> {
        const url: string = `${baseUrl.replace(/\/$/, '')}/__tree`;
        return this.get<LocalTreeResponseDto>(url).pipe(map(r => r.paths ?? []));
    }

    public getFileBase64$(baseUrl: string, path: string): Observable<LocalFileResponseDto> {
        const encoded: string = encodeURIComponent(path);
        const url: string = `${baseUrl.replace(/\/$/, '')}/__file?path=${encoded}`;
        return this.get<LocalFileResponseDto>(url);
    }

    private get<T>(url: string, headers?: Record<string, string>): Observable<T> {
        const httpHeaders: HttpHeaders | undefined = this.toHttpHeaders(headers);
        return this.http.get<T>(url, { headers: httpHeaders })
            .pipe(catchError((e: HttpErrorResponse) => this.handleError(e, 'GET', url)));
    }

    private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
        const normalized: LocalApiError = {
            status: error.status,
            message: (error.error as { message?: string } | undefined)?.message ?? error.message ?? 'Request failed',
            method,
            url
        };
        return throwError((): LocalApiError => normalized);
    }

    private toHttpHeaders(obj?: Record<string, string>): HttpHeaders | undefined {
        if (obj === undefined) return undefined;
        let headers: HttpHeaders = new HttpHeaders();
        (Object.entries(obj) as Array<[string, string]>).forEach(([k, v]: [string, string]): void => {
            headers = headers.set(k, v);
        });
        return headers;
    }
}
