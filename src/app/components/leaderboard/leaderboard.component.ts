import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {

  constructor(public dataService: DataService) { }

  logWorkbook(): void {
    this.dataService.doontWorkbook$
      .pipe(take(1))
      .subscribe((dump) => {
        console.log('Doont.xlsx workbook dump:', dump);
        console.log('Doont.xlsx workbook dump (JSON):', JSON.stringify(dump));
      });
  }
}
