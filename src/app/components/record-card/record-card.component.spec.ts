import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordCardComponent } from './record-card.component';

describe('RecordCardComponent', () => {
    let component: RecordCardComponent;
    let fixture: ComponentFixture<RecordCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecordCardComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(RecordCardComponent);
        component = fixture.componentInstance;
        component.record = {
            gameNumber: 1,
            dateIso: '2025-07-27',
            placements: { first: 'A', second: 'B', third: 'C', fourth: 'D' },
            startTime: null,
            endTime: null,
            durationMinutes: null
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
