import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameComponent } from '../components/frame/frame.component';

@NgModule({
  declarations: [FrameComponent],
  imports: [
    CommonModule
  ],
  exports: [FrameComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule { }
