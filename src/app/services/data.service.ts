import { DestroyRef, Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, map, filter, distinctUntilChanged, EMPTY, catchError, from, mergeMap, scan, shareReplay } from 'rxjs';
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

  // ---- Decoded content (what the UI should typically depend on)
  public readonly decodedFileMap$: Observable<Map<string, Uint8Array>> = this.rawFileMap$.pipe(
    scan(
      (acc: Map<string, Uint8Array>, raw: Map<string, string>): Map<string, Uint8Array> => {
        // When a new batch starts we reset rawFileMap to empty then repopulate.
        // If raw shrank, treat as refresh and clear decoded.
        let next: Map<string, Uint8Array> = acc;
        if (raw.size < acc.size) next = new Map<string, Uint8Array>();

        for (const [path, base64] of raw.entries()) {
          if (next.has(path)) continue;
          const bytes: Uint8Array | null = this.decodeBase64ToBytes(base64);
          if (bytes) {
            if (next === acc) next = new Map<string, Uint8Array>(acc);
            next.set(path, bytes);
          }
        }

        return next;
      },
      new Map<string, Uint8Array>()
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ---- Derived "readiness" streams for UI
  public readonly doontXlsxBytes$: Observable<Uint8Array | null> = this.decodedFileMap$.pipe(
    map((m: Map<string, Uint8Array>): Uint8Array | null => m.get('Doont.xlsx') ?? null),
    distinctUntilChanged()
  );

  public readonly leaderboardReady$: Observable<boolean> = this.doontXlsxBytes$.pipe(
    map((bytes: Uint8Array | null): boolean => (bytes?.byteLength ?? 0) > 0),
    distinctUntilChanged()
  );

  public readonly screenshotsDecodedMap$: Observable<Map<string, Uint8Array>> = this.decodedFileMap$.pipe(
    map((m: Map<string, Uint8Array>): Map<string, Uint8Array> => {
      const out: Map<string, Uint8Array> = new Map<string, Uint8Array>();
      for (const [path, bytes] of m.entries()) {
        if (path.startsWith('screenshots/')) out.set(path, bytes);
      }
      return out;
    })
  );

  public readonly screenshotsCount$: Observable<number> = this.screenshotsDecodedMap$.pipe(
    map((m: Map<string, Uint8Array>): number => m.size),
    distinctUntilChanged()
  );

  public readonly recordsReady$: Observable<boolean> = this.screenshotsCount$.pipe(
    map((n: number): boolean => n > 0),
    distinctUntilChanged()
  );

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

  private decodeBase64ToBytes(base64: string | null | undefined): Uint8Array | null {
    if (!base64) return null;
    try {
      const binary: string = atob(base64);
      const bytes: Uint8Array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }
}
