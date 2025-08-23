import { Component, OnInit } from '@angular/core';
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

  public readonly text$: Observable<string>;

  constructor(private apiService: ApiService) {
    this.text$ = this.apiService.testResponse$;
  }

  ngOnInit(): void {
    this.apiService.getTestFile();
  }

}
