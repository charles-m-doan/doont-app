import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map, filter, distinctUntilChanged, shareReplay, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public readonly sha$: Observable<string> = this.apiService.shaResponse$.pipe(
    map(r => r.sha),
    filter(sha => sha.length > 0),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private apiService: ApiService) {
    this.apiService.getLatestSha();
    this.sha$.pipe(take(1)).subscribe((sha) => {
      console.log(sha);
    });
  }
}
