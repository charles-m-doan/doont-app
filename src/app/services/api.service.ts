import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { UrlBuilder } from '../util/url.builder';
import { ShaResponseDto } from '../models/response.models';

@Injectable({ providedIn: 'root' })
export class ApiService {

  public shaResponse$: Observable<ShaResponseDto>;
  private _shaResponse: BehaviorSubject<ShaResponseDto>;

  constructor(private httpClient: HttpClient) {
    this._shaResponse = new BehaviorSubject({ sha: '' });
    this.shaResponse$ = this._shaResponse.asObservable();
  }

  public getLatestSha(): void {
    const url = UrlBuilder.getLatestShaUrl();
    this.httpClient
      .get<ShaResponseDto>(url, { observe: 'response' })
      .subscribe({
        next: (res: HttpResponse<ShaResponseDto>) => {
          if (res.body) this._shaResponse.next(res.body);
        },
        error: (err: HttpErrorResponse) => console.error('ERROR:', err.message),
      });
  }

}
