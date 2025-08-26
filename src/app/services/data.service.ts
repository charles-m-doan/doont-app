import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map, filter, distinctUntilChanged, take, EMPTY, catchError, exhaustMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GitTreeEntryDto } from '../models/response.models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public readonly sha$: Observable<string> = this.apiService.shaResponse$.pipe(
    map(r => r.object.sha),
    filter(sha => sha.length > 0),
    distinctUntilChanged()
  );

  public readonly fileList$: Observable<GitTreeEntryDto[]> = this.apiService.fileListResponse$.pipe(
    map(r => r.tree),
    distinctUntilChanged()
  );

  constructor(private apiService: ApiService) {
    this.apiService.fetchLatestSha();
    this.sha$.subscribe((sha) => {
      console.log(sha);
      this.apiService.fetchRepoFileList(sha);
    });

    this.fileList$.subscribe((tree) => {
      console.log(tree);
    });
  }
}
