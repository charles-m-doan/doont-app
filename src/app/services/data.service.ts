import { DestroyRef, Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, map, filter, distinctUntilChanged, EMPTY, catchError, from, mergeMap, scan, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GitTreeEntryDto } from '../models/response.models';
import { GitBlobResponseDto } from '../models/response.models';
import * as XLSX from 'xlsx';
import { GameRecordEntry } from '../models/game-record.models';

export interface DoontSheetDump {
  name: string;
  rows: unknown[][];
}

export interface DoontWorkbookDump {
  sheetNames: string[];
  sheets: DoontSheetDump[];
}

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

  public readonly screenshots$: Observable<Array<{ path: string; dataUrl: string }>> = this.rawFileMap$.pipe(
    map((m: Map<string, string>): Array<{ path: string; base64: string }> => {
      const out: Array<{ path: string; base64: string }> = [];
      for (const [path, base64] of m.entries()) {
        if (!path.startsWith('screenshots/')) continue;
        if (!base64) continue;
        out.push({ path, base64 });
      }
      out.sort((a, b) => a.path.localeCompare(b.path));
      return out;
    }),
    map((entries: Array<{ path: string; base64: string }>) =>
      entries.map(({ path, base64 }) => ({
        path,
        dataUrl: `data:${this.guessImageMimeType(path)};base64,${base64}`
      }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ---- Derived "readiness" streams for UI
  public readonly doontXlsxBytes$: Observable<Uint8Array | null> = this.decodedFileMap$.pipe(
    map((m: Map<string, Uint8Array>): Uint8Array | null => m.get('Doont.xlsx') ?? null),
    distinctUntilChanged()
  );

  public readonly doontWorkbook$: Observable<DoontWorkbookDump> = this.doontXlsxBytes$.pipe(
    filter((bytes: Uint8Array | null): bytes is Uint8Array => bytes !== null && bytes.byteLength > 0),
    map((bytes: Uint8Array): DoontWorkbookDump => this.parseDoontWorkbook(bytes)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly gameRecords$: Observable<GameRecordEntry[]> = this.doontWorkbook$.pipe(
    map((wb: DoontWorkbookDump): GameRecordEntry[] => this.parseGameRecords(wb)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly gameRecordsByDate$: Observable<Map<string, GameRecordEntry>> = this.gameRecords$.pipe(
    map((rows: GameRecordEntry[]): Map<string, GameRecordEntry> => {
      const out: Map<string, GameRecordEntry> = new Map<string, GameRecordEntry>();
      for (const row of rows) out.set(row.dateIso, row);
      return out;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly leaderboardReady$: Observable<boolean> = this.doontXlsxBytes$.pipe(
    map((bytes: Uint8Array | null): boolean => (bytes?.byteLength ?? 0) > 0),
    distinctUntilChanged()
  );

  public readonly screenshotsCount$: Observable<number> = this.screenshots$.pipe(
    map((arr: Array<{ path: string; dataUrl: string }>): number => arr.length),
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

  private parseDoontWorkbook(bytes: Uint8Array): DoontWorkbookDump {
    // Copy into a fresh ArrayBuffer (avoids ArrayBuffer|SharedArrayBuffer typing issues).
    const ab: ArrayBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    const wb: XLSX.WorkBook = XLSX.read(ab, { type: 'array' });
    const sheetNames: string[] = wb.SheetNames ?? [];
    const sheets: DoontSheetDump[] = sheetNames.map((name: string): DoontSheetDump => {
      const ws: XLSX.WorkSheet | undefined = wb.Sheets?.[name];
      // header:1 returns an array-of-arrays (raw grid) which is easiest for messy sheets.
      const rows: unknown[][] = ws ? (XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as unknown[][]) : [];
      return { name, rows };
    });
    return { sheetNames, sheets };
  }

  private parseGameRecords(wb: DoontWorkbookDump): GameRecordEntry[] {
    const sheet: DoontSheetDump | undefined = wb.sheets.find(s => s.name === 'Game_Record');
    const rows: unknown[][] = sheet?.rows ?? [];
    if (rows.length <= 1) return [];

    const out: GameRecordEntry[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row: unknown[] = rows[i] ?? [];
      const gameNumber: number = this.toNumber(row[0]);
      const dateIso: string | null = this.excelSerialDateToIso(row[1]);
      if (!Number.isFinite(gameNumber) || !dateIso) continue;

      const startTime: string | null = this.excelSerialTimeToHHmm(row[8]);
      const endTime: string | null = this.excelSerialTimeToHHmm(row[9]);
      const durationMinutes: number | null = this.excelSerialDurationToMinutes(row[10]);

      out.push({
        gameNumber,
        dateIso,
        placements: {
          first: this.toStringOrNull(row[2]),
          second: this.toStringOrNull(row[3]),
          third: this.toStringOrNull(row[4]),
          fourth: this.toStringOrNull(row[5])
        },
        startTime,
        endTime,
        durationMinutes
      });
    }

    out.sort((a, b) => a.gameNumber - b.gameNumber);
    return out;
  }

  private excelSerialDateToIso(value: unknown): string | null {
    const serial: number = this.toNumber(value);
    if (!Number.isFinite(serial) || serial <= 0) return null;
    const dc = XLSX.SSF.parse_date_code(serial);
    if (!dc) return null;
    const y: number = dc.y;
    const m: number = dc.m;
    const d: number = dc.d;
    if (!y || !m || !d) return null;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  private excelSerialTimeToHHmm(value: unknown): string | null {
    if (value == null) return null;
    const serial: number = this.toNumber(value);
    if (!Number.isFinite(serial) || serial <= 0) return null;
    const dc = XLSX.SSF.parse_date_code(serial);
    if (!dc) return null;
    const hh: number = dc.H ?? 0;
    const mm: number = dc.M ?? 0;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  private excelSerialDurationToMinutes(value: unknown): number | null {
    if (value == null) return null;
    const serial: number = this.toNumber(value);
    if (!Number.isFinite(serial) || serial <= 0) return null;
    // Excel duration stored as fraction of a day
    return Math.round(serial * 24 * 60);
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim().length > 0) return Number(value);
    return Number.NaN;
  }

  private toStringOrNull(value: unknown): string | null {
    if (value == null) return null;
    const s: string = String(value).trim();
    return s.length > 0 ? s : null;
  }

  private guessImageMimeType(path: string): string {
    const p: string = (path ?? '').toLowerCase();
    if (p.endsWith('.png')) return 'image/png';
    if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
    if (p.endsWith('.gif')) return 'image/gif';
    if (p.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
  }
}
