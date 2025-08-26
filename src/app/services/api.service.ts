import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { UrlBuilder } from '../util/url.builder';
import { ShaResponseDto } from '../models/response.models';
import { EMPTY_SHA_RESPONSE } from '../models/response.constants';
import { cloneDeep } from 'lodash';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly httpClient: HttpClient = inject(HttpClient);

  private _shaResponse: BehaviorSubject<ShaResponseDto> = new BehaviorSubject<ShaResponseDto>(cloneDeep(EMPTY_SHA_RESPONSE));
  public shaResponse$: Observable<ShaResponseDto> = this._shaResponse.asObservable();

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
