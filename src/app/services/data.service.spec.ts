import { TestBed } from '@angular/core/testing';

import { DataService } from './data.service';
import { ApiService } from './api.service';
import { LocalDataApiService } from './local-data-api.service';
import { createMockProvider } from '../testing/mocking-util';
import { ngMocks } from 'ng-mocks';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        createMockProvider(ApiService),
        createMockProvider(LocalDataApiService)
      ]
    });
    ngMocks.autoSpy('jasmine');
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
