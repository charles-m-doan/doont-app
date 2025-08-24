import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map, filter, distinctUntilChanged, take, EMPTY, catchError, exhaustMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public readonly sha$: Observable<string> = this.apiService.shaResponse$.pipe(
    map(r => r.sha),
    filter(sha => sha.length > 0),
    distinctUntilChanged()
  );

  constructor(private apiService: ApiService) {
    this.apiService.getLatestSha();

    this.sha$.pipe(take(1)).subscribe((sha) => {
      console.log(sha);
    });
  }
}
