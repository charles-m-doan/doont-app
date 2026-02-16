import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
    selector: 'app-records',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './records.component.html',
    styleUrl: './records.component.css'
})
export class RecordsComponent {
    constructor(public dataService: DataService) { }
}
