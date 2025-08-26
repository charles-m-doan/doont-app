import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, throwError, take } from 'rxjs';
import { UrlBuilder } from '../util/url.builder';
import { ApiError, GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from '../models/response.models';
import { EMPTY_BLOB_RESPONSE, EMPTY_FILE_LIST_RESPONSE, EMPTY_SHA_RESPONSE } from '../models/response.constants';
import { cloneDeep } from 'lodash';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http: HttpClient = inject(HttpClient);

  private readonly _shaResponse: BehaviorSubject<ShaResponseDto> = new BehaviorSubject<ShaResponseDto>(cloneDeep(EMPTY_SHA_RESPONSE));
  public readonly shaResponse$: Observable<ShaResponseDto> = this._shaResponse.asObservable();

  private readonly _fileListResponse: BehaviorSubject<GitTreeResponseDto> = new BehaviorSubject<GitTreeResponseDto>(cloneDeep(EMPTY_FILE_LIST_RESPONSE));
  public readonly fileListResponse$: Observable<GitTreeResponseDto> = this._fileListResponse.asObservable();

  private readonly _blobResponse: BehaviorSubject<GitBlobResponseDto> = new BehaviorSubject<GitBlobResponseDto>(cloneDeep(EMPTY_BLOB_RESPONSE));
  public readonly blobResponse$: Observable<GitBlobResponseDto> = this._blobResponse.asObservable();

  public fetchLatestSha(): void {
    const url = UrlBuilder.getLatestShaUrl();
    this.get<ShaResponseDto>(url)
      .pipe(take(1))
      .subscribe({
        next: (res: ShaResponseDto): void => { this._shaResponse.next(res); },
        error: (err: ApiError): void => { console.error(err); }
      });
  }

  public fetchRepoFileList(sha: string): void {
    const url: string = UrlBuilder.getFileListUrl(sha);
    this.get<GitTreeResponseDto>(url)
      .pipe(take(1))
      .subscribe({
        next: (res: GitTreeResponseDto): void => { this._fileListResponse.next(res); },
        error: (err: ApiError): void => { console.error(err); }
      });
  }

  public fetchBlob(sha: string): void {
    const url: string = UrlBuilder.getBlobUrl(sha);
    this.get<GitBlobResponseDto>(url)
      .pipe(take(1))
      .subscribe({
        next: (res: GitBlobResponseDto): void => { this._blobResponse.next(res); },
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
