import { DestroyRef, Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, map, filter, distinctUntilChanged, EMPTY, catchError, from, mergeMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GitTreeEntryDto } from '../models/response.models';
import { GitBlobResponseDto } from '../models/response.models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly _rawFileMap: BehaviorSubject<Map<string, string>> = new BehaviorSubject<Map<string, string>>(new Map<string, string>());
  public readonly rawFileMap$: Observable<Map<string, string>> = this._rawFileMap.asObservable();

  private readonly BLOB_FETCH_CONCURRENCY: number = 3;

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

    this.sha$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sha: string): void => {
        this.apiService.fetchRepoFileList(sha);
      });

    this.fileList$
      .pipe(
        map((entries: GitTreeEntryDto[]): GitTreeEntryDto[] => entries.filter(e => e.type === 'blob')),
        filter((blobs: GitTreeEntryDto[]): boolean => blobs.length > 0),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((blobs: GitTreeEntryDto[]): void => {
        this.fetchAndStoreBlobs(blobs);
      });
  }

  private fetchAndStoreBlobs(blobs: GitTreeEntryDto[]): void {
    // New batch: reset map so consumers can treat this as a full refresh.
    this._rawFileMap.next(new Map<string, string>());

    from(blobs)
      .pipe(
        mergeMap(
          (entry: GitTreeEntryDto) => this.apiService.getBlob$(entry.sha)
            .pipe(
              map((blob: GitBlobResponseDto) => ({ path: entry.path, base64: this.normalizeBase64(blob.content) })),
              catchError(() => EMPTY)
            ),
          this.BLOB_FETCH_CONCURRENCY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ path, base64 }: { path: string; base64: string }): void => {
        const nextMap: Map<string, string> = new Map<string, string>(this._rawFileMap.value);
        nextMap.set(path, base64);
        this._rawFileMap.next(nextMap);
      });
  }

  private normalizeBase64(content: string | null | undefined): string {
    // GitHub blob API often inserts newlines; strip whitespace for easier decoding later.
    return (content ?? '').replace(/\s+/g, '');
  }
}
