import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {

  constructor(private dataService: DataService) {}

}
