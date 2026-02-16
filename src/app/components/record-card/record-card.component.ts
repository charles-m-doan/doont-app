import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GameRecordEntry, ScreenshotStatus } from '../../models/game-record.models';

@Component({
    selector: 'app-record-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './record-card.component.html',
    styleUrl: './record-card.component.css'
})
export class RecordCardComponent {
    @Input({ required: true }) record!: GameRecordEntry;
    @Input() screenshotUrl: string | null = null;
    @Input() screenshotPath: string | null = null;
    @Input() screenshotStatus: ScreenshotStatus = 'searching';
}
