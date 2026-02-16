import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ngMocks } from 'ng-mocks';
import { ApiService } from './services/api.service';
import { createMockProvider } from './testing/mocking-util';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        createMockProvider(ApiService)
      ]
    }).compileComponents();
    ngMocks.autoSpy('jasmine');
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'DOONT' title`, () => {
    expect(component.title).toEqual('DOONT');
  });
});
