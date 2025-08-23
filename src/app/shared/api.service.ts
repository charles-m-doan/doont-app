import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  public static readonly testUrl: string = 'https://raw.githubusercontent.com/charles-m-doan/doont/refs/heads/main/test.txt';

  public testResponse$: Observable<string>;
  private _testResponse: BehaviorSubject<string>;

  constructor(private httpClient: HttpClient) {
    this._testResponse = new BehaviorSubject('Default Text');
    this.testResponse$ = this._testResponse.asObservable();
  }

  public getTestFile(): void {
  this.httpClient
    .get(ApiService.testUrl, {
      observe: 'response',
      responseType: 'text',             // <-- key
    })
    .subscribe({
      next: (res: HttpResponse<string>) => {
        console.log('SUCCESS:', res.body);
        this._testResponse.next(res.body ?? '');
      },
      error: (err: HttpErrorResponse) => {
        console.error('ERROR:', err.message);
      },
    });
  }

  
}

