import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { ngMocks } from 'ng-mocks';
import { HttpClient } from '@angular/common/http';
import { createMockProvider } from '../testing/test-util';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        createMockProvider(HttpClient)
      ]
    });
    ngMocks.autoSpy('jasmine');
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
