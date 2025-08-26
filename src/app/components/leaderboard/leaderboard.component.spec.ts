import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardComponent } from './leaderboard.component';
import { ApiService } from '../../services/api.service';
import { createMockProvider } from '../../testing/mocking-util';
import { ngMocks } from 'ng-mocks';
import { DataService } from '../../services/data.service';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent],
      providers: [
        // createMockProvider(ApiService),
        createMockProvider(DataService)
      ]
    })
      .compileComponents();
    ngMocks.autoSpy('jasmine');
    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
