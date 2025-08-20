import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ComponentsModule } from './modules/components.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsModule],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

});