import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map, switchMap } from 'rxjs';
import * as XLSX from 'xlsx';

type GhBranch = { name: string; commit: { sha: string } };
type GhCommit = { tree: { sha: string } };
type GhTreeResp = { tree: Array<{ path: string; type: 'blob' | 'tree' }> };

@Injectable({ providedIn: 'root' })
export class ApiService {

  private static readonly GH_OWNER = 'charles-m-doan';
  private static readonly GH_REPO = 'doont';
  private static readonly GH_BRANCH = 'main';

  public static readonly TEST_URL: string = 'https://raw.githubusercontent.com/charles-m-doan/doont/refs/heads/main/test.txt';
  public static readonly DOONT_XLSX_URL: string = 'https://raw.githubusercontent.com/charles-m-doan/doont/main/Doont.xlsx';

  public testResponse$: Observable<string>;
  private _testResponse: BehaviorSubject<string>;

  public doontXlsx$: Observable<Record<string, any[]>>;
  private _doontXlsx: BehaviorSubject<Record<string, any[]>>;

  private _repoFiles = new BehaviorSubject<string[]>([]);
  public repoFiles$: Observable<string[]> = this._repoFiles.asObservable();

  constructor(private httpClient: HttpClient) {
    this._testResponse = new BehaviorSubject('Default Text');
    this.testResponse$ = this._testResponse.asObservable();

    this._doontXlsx = new BehaviorSubject<Record<string, any[]>>({});
    this.doontXlsx$ = this._doontXlsx.asObservable();

    this._repoFiles = new BehaviorSubject<string[]>([]);
    this.repoFiles$ = this._repoFiles.asObservable();
  }

  public getTestFile(): void {
    this.httpClient
      .get(ApiService.TEST_URL, {
        observe: 'response',
        responseType: 'text',
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

  public getDoontXlsx(): void {
    this.httpClient
      .get(ApiService.DOONT_XLSX_URL, {
        observe: 'response',
        responseType: 'arraybuffer',
      })
      .subscribe({
        next: (res: HttpResponse<ArrayBuffer>) => {
          try {
            const wb = XLSX.read(res.body as ArrayBuffer, {
              type: 'array',
              cellDates: true,          // dates → JS Date when possible
            });

            const json: Record<string, any[]> = {};
            for (const name of wb.SheetNames) {
              const ws = wb.Sheets[name];

              // Let SheetJS apply formatting (dates, etc.)
              const rows = XLSX.utils.sheet_to_json(ws, {
                defval: null,
                raw: false,              // format cell values (e.g., dates)
                // dateNF only applies when cells are numeric date serials:
                dateNF: 'yyyy-mm-dd',
                blankrows: false,
              });

              // Optional cleanup: drop __EMPTY* keys and normalize Date fields
              const cleaned = rows.map((r: any) => {
                // remove __EMPTY columns created by blank headers
                for (const k of Object.keys(r)) {
                  if (k.startsWith('__EMPTY')) delete r[k];
                }
                // normalize a column literally named "Date" (adjust if your header differs)
                if (r.Date != null) {
                  if (r.Date instanceof Date) {
                    r.Date = r.Date.toISOString().slice(0, 10); // YYYY-MM-DD
                  } else if (typeof r.Date === 'number') {
                    // numeric Excel serial → formatted string
                    r.Date = XLSX.SSF.format('yyyy-mm-dd', r.Date);
                  }
                }
                return r;
              });

              json[name] = cleaned;
            }

            console.log('XLSX PARSE SUCCESS:', json);
            this._doontXlsx.next(json);
          } catch (e: any) {
            console.error('XLSX PARSE ERROR:', e?.message ?? e);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('HTTP ERROR (XLSX):', err.message);
        },
      });
  }

  /** Get ALL files in repo (paths), recursively */
  public getRepoFiles(): void {
    const o = ApiService.GH_OWNER, r = ApiService.GH_REPO, b = ApiService.GH_BRANCH;
    const headers = { Accept: 'application/vnd.github+json' };

    this.httpClient.get<GhBranch>(`https://api.github.com/repos/${o}/${r}/branches/${b}`, { headers }).pipe(
      switchMap(branch =>
        this.httpClient.get<GhCommit>(`https://api.github.com/repos/${o}/${r}/git/commits/${branch.commit.sha}`, { headers })
      ),
      switchMap(commit =>
        this.httpClient.get<GhTreeResp>(
          `https://api.github.com/repos/${o}/${r}/git/trees/${commit.tree.sha}`,
          { headers, params: { recursive: '1' } }
        )
      ),
      map(resp => resp.tree.filter(n => n.type === 'blob').map(n => n.path)) // files only
    )
      .subscribe({
        next: (paths) => {
          console.log('REPO FILES COUNT:', paths.length);
          this._repoFiles.next(paths);
        },
        error: (err: HttpErrorResponse) => {
          console.error('HTTP ERROR (repo tree):', err.message);
        }
      });
  }

}
