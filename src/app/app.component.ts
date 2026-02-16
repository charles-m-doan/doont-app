import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { RecordsComponent } from './components/records/records.component';

type TabId = 'records' | 'leaderboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LeaderboardComponent, RecordsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DOONT';

  activeTab: TabId = 'records';

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }
}
