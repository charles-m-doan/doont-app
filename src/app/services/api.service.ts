import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { UrlBuilder } from '../util/url.builder';
import { ApiError, GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from '../models/response.models';
import { emptyShaResponse, emptyFileListResponse, emptyBlobResponse } from '../models/response.constants';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http: HttpClient = inject(HttpClient);

  private readonly _shaResponse: BehaviorSubject<ShaResponseDto> = new BehaviorSubject<ShaResponseDto>(emptyShaResponse());
  public readonly shaResponse$: Observable<ShaResponseDto> = this._shaResponse.asObservable();

  private readonly _fileListResponse: BehaviorSubject<GitTreeResponseDto> = new BehaviorSubject<GitTreeResponseDto>(emptyFileListResponse());
  public readonly fileListResponse$: Observable<GitTreeResponseDto> = this._fileListResponse.asObservable();

  private readonly _blobResponse: BehaviorSubject<GitBlobResponseDto> = new BehaviorSubject<GitBlobResponseDto>(emptyBlobResponse());
  public readonly blobResponse$: Observable<GitBlobResponseDto> = this._blobResponse.asObservable();

  public fetchLatestSha(): void {
    const url = UrlBuilder.getLatestShaUrl();
    this.get<ShaResponseDto>(url)
      .subscribe({
        next: (res: ShaResponseDto): void => { this._shaResponse.next(res); },
        error: (err: ApiError): void => { console.error(err); }
      });
  }

  public fetchRepoFileList(sha: string): void {
    const url: string = UrlBuilder.getFileListUrl(sha);
    this.get<GitTreeResponseDto>(url)
      .subscribe({
        next: (res: GitTreeResponseDto): void => { this._fileListResponse.next(res); },
        error: (err: ApiError): void => { console.error(err); }
      });
  }

  public fetchBlob(sha: string): void {
    const url: string = UrlBuilder.getBlobUrl(sha);
    this.get<GitBlobResponseDto>(url)
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
