import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RecordCardComponent } from '../record-card/record-card.component';

@Component({
    selector: 'app-records',
    standalone: true,
    imports: [CommonModule, RecordCardComponent],
    templateUrl: './records.component.html',
    styleUrl: './records.component.css'
})
export class RecordsComponent {
    constructor(public dataService: DataService) { }
}
