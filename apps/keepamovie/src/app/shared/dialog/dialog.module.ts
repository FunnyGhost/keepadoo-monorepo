import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { SvgIconsModule } from '@ngneat/svg-icon';

@NgModule({
  declarations: [DialogComponent],
  imports: [CommonModule, SvgIconsModule.forChild([])],
  exports: [DialogComponent]
})
export class DialogModule {}
