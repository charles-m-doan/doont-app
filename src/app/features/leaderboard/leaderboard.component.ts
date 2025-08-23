import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {

  @ViewChild('bgm', { static: true }) bgm!: ElementRef<HTMLAudioElement>;

  public readonly text$: Observable<string>;
  public readonly doontXlsx$: Observable<Record<string, any[]>>;
  public readonly repoFiles$: Observable<string[]>;

  constructor(private apiService: ApiService) {
    this.text$ = this.apiService.testResponse$;
    this.doontXlsx$ = this.apiService.doontXlsx$;
    this.repoFiles$ = this.apiService.repoFiles$;
  }

  ngOnInit(): void {
    this.apiService.getTestFile();
    this.apiService.getDoontXlsx();
    this.apiService.getRepoFiles();
  }

  ngAfterViewInit() {
    const el = this.bgm.nativeElement;
    el.play().catch(() => { });
    const unlock = () => {
      el.muted = false;
      el.play().catch(() => { });
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      console.log("UNMUTE!");
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

}
