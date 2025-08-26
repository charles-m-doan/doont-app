import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, throwError, take } from 'rxjs';
import { UrlBuilder } from '../util/url.builder';
import { ApiError, GitBlob, ShaResponseDto } from '../models/response.models';
import { EMPTY_BLOB_RESPONSE, EMPTY_SHA_RESPONSE } from '../models/response.constants';
import { cloneDeep } from 'lodash';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http: HttpClient = inject(HttpClient);

  private readonly _shaResponse: BehaviorSubject<ShaResponseDto> = new BehaviorSubject<ShaResponseDto>(cloneDeep(EMPTY_SHA_RESPONSE));
  public readonly shaResponse$: Observable<ShaResponseDto> = this._shaResponse.asObservable();

  private readonly blobSubject: BehaviorSubject<GitBlob> = new BehaviorSubject<GitBlob>(cloneDeep(EMPTY_BLOB_RESPONSE));
  public readonly blob$: Observable<GitBlob> = this.blobSubject.asObservable();

  public fetchLatestSha(): void {
    const url = UrlBuilder.getLatestShaUrl();
    this.http
      .get<ShaResponseDto>(url, { observe: 'response' })
      .subscribe({
        next: (res: HttpResponse<ShaResponseDto>) => {
          if (res.body) this._shaResponse.next(res.body);
        },
        error: (err: HttpErrorResponse) => console.error('ERROR:', err.message),
      });
  }

  public fetchBlob(sha: string): void {
    const url: string = UrlBuilder.getBlobUrl(sha);
    this.get<GitBlob>(url)
      .pipe(take(1))
      .subscribe({
        next: (res: GitBlob): void => { this.blobSubject.next(res); },
        error: (err: ApiError): void => { console.error(err); }
      });
  }

  // ---- Internal HTTP helper + common error handling
  private get<T>(url: string, headers?: Record<string, string>): Observable<T> {
    const httpHeaders: HttpHeaders | undefined = this.toHttpHeaders(headers);
    return this.http.get<T>(url, { headers: httpHeaders })
      .pipe(catchError((e: HttpErrorResponse) => this.handleError(e, 'GET', url)));
  }

  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    const normalized: ApiError = {
      status: error.status,
      message: (error.error as { message?: string } | undefined)?.message ?? error.message ?? 'Request failed',
      method,
      url
    };
    return throwError((): ApiError => normalized);
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
