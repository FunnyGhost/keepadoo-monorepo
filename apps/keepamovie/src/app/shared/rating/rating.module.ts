import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingPipe } from './rating.pipe';

@NgModule({
  declarations: [RatingPipe],
  imports: [CommonModule],
  exports: [RatingPipe]
})
export class RatingModule {}
