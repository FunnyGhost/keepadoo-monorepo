import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingComponent } from './rating/rating.component';
import { SvgIconsModule } from '@ngneat/svg-icon';

@NgModule({
  declarations: [RatingComponent],
  imports: [CommonModule, SvgIconsModule.forChild([])],
  exports: [RatingComponent]
})
export class RatingModule {}
