import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsComponent } from './records.component';
import { createMockProvider } from '../../testing/mocking-util';
import { ngMocks } from 'ng-mocks';
import { DataService } from '../../services/data.service';

describe('RecordsComponent', () => {
    let component: RecordsComponent;
    let fixture: ComponentFixture<RecordsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecordsComponent],
            providers: [createMockProvider(DataService)]
        }).compileComponents();

        ngMocks.autoSpy('jasmine');
        fixture = TestBed.createComponent(RecordsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
