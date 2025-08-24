import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
  }

}
